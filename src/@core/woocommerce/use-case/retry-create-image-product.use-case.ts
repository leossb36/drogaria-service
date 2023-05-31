import MysqlConnection from '@config/mysql.config';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ScrapImagesUseCase } from './scrap-image-to-product.use-case';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';

@Injectable()
export class RetryScrapImageProductUseCase {
  constructor(
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly productRepository: ProductRepository,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
  ) {}

  async execute() {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const productsFromWooCommerce =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);

    const getProductsWithoutImageWrongImage = productsFromWooCommerce
      .filter((product) => product.thumbnail === '5934')
      .slice(0, 5);

    const mongoProducts = await this.productRepository.getProductsBySku(
      getProductsWithoutImageWrongImage.map((prod) => prod.sku),
    );

    let retry = 1;
    while (retry < 3) {
      const refreshProducts =
        await this.getProductsFromWoocommerceUseCase.execute(
          pool,
          getProductsWithoutImageWrongImage.map((product) => product.sku),
        );

      const productsToRetry = refreshProducts.filter(
        (product) => product.thumbnail === '5934',
      );

      if (!productsToRetry.length) {
        break;
      }

      const needRetry = productsToRetry.some(
        (product) => product.thumbnail === '5934',
      );

      if (needRetry) {
        const productsToRetryOnMongo =
          await this.productRepository.getProductsBySku(
            productsToRetry.map((product) => product.sku),
          );
        const scrapImageToProductOnWoocommerce =
          await this.scrapImagesUseCase.execute(productsToRetryOnMongo, retry);

        const updateDocs = scrapImageToProductOnWoocommerce.map((mongoPrd) => {
          const wooProduct = getProductsWithoutImageWrongImage.filter(
            (wooPrd) => wooPrd.sku === mongoPrd.sku,
          );
          return {
            id: wooProduct[0].id,
            images: mongoPrd.images,
            name: mongoPrd.name,
            description: mongoPrd.description,
          };
        });

        for (const product of updateDocs) {
          await Promise.all([
            this.woocommerceIntegration.createMedia(product, pool),
          ]);
        }
      }
      retry++;
    }
    await MysqlConnection.endConnection(pool);

    return {
      count: mongoProducts.length,
      ids: getProductsWithoutImageWrongImage.map((product) => product.id),
      message: 'Products updated successfully!',
    };
  }
}
