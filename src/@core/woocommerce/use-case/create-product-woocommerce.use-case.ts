import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import * as mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import MysqlConnection from '@config/mysql.config';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class CreateProductOnWoocommerce {
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

      const getProductsWithoutImage = productsFromWooCommerce.filter(
        (product) => !product.thumbnail,
      );

      const productsOnDataBase =
        await this.productRepository.findProductsWithoutImageAndNotInWooCommerce(
          getProductsWithoutImage.map((prd) => prd.sku),
          50,
        );

      if (!productsOnDataBase.length) {
        await MysqlConnection.endConnection(pool);
        return [];
      }

      const chunks = ChunckData(productsOnDataBase);

      const result = [];
      for (const chunk of chunks) {
        const products = await this.woocommerceIntegration.createProductBatch(
          chunk,
        );
        result.push(...products.data?.create);
      }
      await MysqlConnection.endConnection(pool);
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
            thumbnail: prd.meta_key === '_thumbnail' ? prd.meta_value : null,
          };
        }),
    );

    return products;
  }
}
