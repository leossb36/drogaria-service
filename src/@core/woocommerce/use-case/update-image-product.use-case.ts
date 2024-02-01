import MysqlConnection from '@config/mysql.config';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class UpdateImageProductUseCase {
  constructor(
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute() {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const productsFromWooCommerce =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);

    const getProductsWithoutImage = productsFromWooCommerce.filter(
      (product) => !product.thumbnail,
    );

    if (!getProductsWithoutImage.length) {
      await MysqlConnection.endConnection(pool);
      return {
        message: `There's no product to update image`,
      };
    }

    const mongoProducts = (
      await this.productRepository.getProductsBySku(
        getProductsWithoutImage.map((prod) => prod.sku),
      )
    ).slice(0, 5);
    const updateDocs = mongoProducts.map((mongoPrd) => {
      const wooProduct = getProductsWithoutImage.find(
        (wooPrd) => wooPrd.sku === mongoPrd.sku,
      );
      return {
        id: wooProduct.id,
        images: mongoPrd.images,
        name: mongoPrd.name,
        description: mongoPrd.description,
        stock_quantity: mongoPrd.stock_quantity,
      };
    });
    for (const product of updateDocs) {
      await Promise.all([
        this.woocommerceIntegration.createMedia(product, pool),
      ]);
    }
    await MysqlConnection.endConnection(pool);
    return {
      message: 'product created successfully',
    };
  }
}
