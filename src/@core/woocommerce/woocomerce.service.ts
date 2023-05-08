import CustomLogger from '@common/logger/logger';
import MysqlConnection from '@config/mysql.config';
import { headersTopicEnum } from '@core/application/dto/enum/headers-topic.enum';
import { webhookStatusEnum } from '@core/application/dto/enum/webhook-status.enum';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { CreateProductWithImagesOnWoocommerce } from '@core/application/use-cases/woocommerce/create-product-with-images-woocommerce.use-case';
import { CreateProductOnWoocommerce } from '@core/application/use-cases/woocommerce/create-product-woocommerce.use-case';
import { ScrapImagesUseCase } from '@core/application/use-cases/woocommerce/scrap-image-to-product.use-case';
import { GetProductsFromWoocommerceUseCase } from '@core/application/use-cases/wordpress/get-products-from-woocommerce.use-case';
import { ProductRepository } from '@core/infra/db/repositories/mongo/product.repository';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as mysql from 'mysql2/promise';

@Injectable()
export class WoocommerceService {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly createProductWithImagesOnWoocommerce: CreateProductWithImagesOnWoocommerce,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async createProductRoutineOnMongo() {
    const products = await this.productRepository.findProductsWithoutImage(100);

    const scrapImagesProducts = await this.scrapImagesUseCase.execute(
      products,
      0,
    );

    return {
      mongo: scrapImagesProducts.length,
      message: 'product created successfully',
    };
  }

  // @Cron('0 */3 * * * *')
  async createProductRoutineOnWoocommerce() {
    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  Start job`,
    );
    const [productsWithImages] = await Promise.all([
      this.createProductWithImagesOnWoocommerce.execute(),
    ]);

    if (!productsWithImages.length) {
      CustomLogger.info(
        `[WoocommerceService - createProductRoutineOnWoocommerce]  End job - no products`,
      );
      return {
        data: [],
        message: 'Cannot find any products to create on woocommerce',
      };
    }
    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  End job`,
    );
    return {
      data: productsWithImages.length,
      message: 'product created successfully',
    };
  }

  // @Cron('0 */3 * * * *')
  async updateProductRoutine() {
    CustomLogger.info(`[WoocommerceService - updateProductRoutine]  Start job`);

    const pool: mysql.Pool = await MysqlConnection.connect();

    const productsFromWooCommerce =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);

    const getProductsWithoutImage = productsFromWooCommerce.filter(
      (product) => !product.thumbnail,
    );

    if (!getProductsWithoutImage.length) {
      MysqlConnection.endConnection(pool);
      CustomLogger.info(`[WoocommerceService - updateProductRoutine]  end job`);
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
      };
    });
    for (const product of updateDocs) {
      await Promise.all([
        this.woocommerceIntegration.createMedia(product, pool),
      ]);
    }
    MysqlConnection.endConnection(pool);
    CustomLogger.info(`[WoocommerceService - updateProductRoutine]  end job`);
    return {
      message: 'product created successfully',
    };
  }

  // @Cron('0 */3 * * * *')
  async retryScrapNewImage() {
    CustomLogger.info(`[WoocommerceService - retryScrapNewImage]  Start job`);
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
    while (retry < 6) {
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
    CustomLogger.info(`[WoocommerceService - retryScrapNewImage]  End job`);
    MysqlConnection.endConnection(pool);

    return {
      count: mongoProducts.length,
      ids: getProductsWithoutImageWrongImage.map((product) => product.id),
      message: 'Products updated successfully!',
    };
  }
}
