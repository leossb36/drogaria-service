import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import * as mysql from 'mysql2/promise';
import MysqlConnection from '@config/mysql.config';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';

@Injectable()
export class CreateProductWithImagesOnWoocommerce {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any[]> {
    try {
      const pool: mysql.Pool = await MysqlConnection.connect();
      const productsFromWooCommerce =
        await this.getProductsFromWoocommerceUseCase.execute(pool, []);

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
        await MysqlConnection.endConnection(pool);
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
      await MysqlConnection.endConnection(pool);
      return result;
    } catch (error) {
      return [];
    }
  }
}
