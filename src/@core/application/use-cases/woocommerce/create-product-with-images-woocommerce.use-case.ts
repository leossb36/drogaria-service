import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import { ProductRepository } from '@core/infra/db/repositories/mongo/product.repository';
import * as mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import MysqlConnection from '@config/mysql.config';

@Injectable()
export class CreateProductWithImagesOnWoocommerce {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any[]> {
    try {
      const pool: mysql.Pool = await MysqlConnection.connect();
      const productsFromWooCommerce = await this.getProductsFromWoocommerce(
        pool,
      );

      const productsOnDataBase =
        await this.productRepository.findProductsWithImageAndNotInWooCommerce(
          productsFromWooCommerce.map((prd) => prd.sku),
          100,
        );

      const filtered = JSON.parse(JSON.stringify(productsOnDataBase)).filter(
        (product) => {
          if (product.images.length) delete product.images;
          return product;
        },
      );

      if (!filtered.length) {
        MysqlConnection.endConnection(pool);
        return [];
      }

      const chunks = ChunckData(filtered);

      const result = [];
      for (const chunk of chunks) {
        const products = await this.woocommerceIntegration.createProductBatch(
          chunk,
        );
        result.push(...products.data?.create);
      }
      MysqlConnection.endConnection(pool);
      return result;
    } catch (error) {
      return null;
    }
  }

  private async getProductsFromWoocommerce(pool: mysql.Pool): Promise<any[]> {
    const products = [];
    const [rows, fields] = await pool.query(
      `SELECT * from wp_posts wp
          JOIN wp_postmeta wp2 ON wp2.post_id = wp.ID
        WHERE wp.post_type = "product"`,
    );

    const results = (rows as RowDataPacket[]).map((row) => row);
    products.push(
      ...results
        .filter((product) => product.meta_key === '_sku')
        .map((prd) => {
          return {
            id: prd['ID'],
            sku: prd.meta_value,
            title: prd.post_title,
            description: prd.post_content,
            thumbnail: prd.meta_key === '_thumbnail_id' ? prd.meta_value : null,
          };
        }),
    );

    return products;
  }
}
