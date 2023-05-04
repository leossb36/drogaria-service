import CustomLogger from '@common/logger/logger';
import MysqlConnection from '@config/mysql.config';
import { headersTopicEnum } from '@core/application/dto/enum/headers-topic.enum';
import { webhookStatusEnum } from '@core/application/dto/enum/webhook-status.enum';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
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
    private readonly vetorCreateOrderUseCase: CreateOrderUseCase,
    private readonly createProductOnWoocommerce: CreateProductOnWoocommerce,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  // @Cron('0 */2 * * * *')
  async createProductService() {
    const products = await this.productRepository.findProductsWithoutImage(5);

    const createdProductsWithoutImageAndNotOnWoocommerce =
      await this.createProductRoutineOnWoocommerce(products);

    const scrapImageToProductOnWoocommerce =
      await this.scrapImagesUseCase.execute(
        createdProductsWithoutImageAndNotOnWoocommerce,
        0,
      );

    const fullProducts = scrapImageToProductOnWoocommerce.map((product) => ({
      ...product,
      id: createdProductsWithoutImageAndNotOnWoocommerce.find(
        (prd) => prd.sku === product.sku,
      ).id,
    }));

    const updatedProducts = await this.updateProductWithImage(fullProducts);

    return {
      count: updatedProducts.length,
      ids: updatedProducts.map((product) => product.id),
      message: 'product created successfully',
    };
  }

  private async createProductRoutineOnWoocommerce(products: any[]) {
    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  Start job`,
    );

    const createdProductsWithoutImage =
      await this.createProductOnWoocommerce.execute(products);

    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  End job`,
    );

    return createdProductsWithoutImage;
  }

  private async updateProductWithImage(productsCreated: any[]) {
    CustomLogger.info(
      `[WoocommerceService - updateProductWithImage]  Start job`,
    );
    const pool: mysql.Pool = await MysqlConnection.connect();

    const products = productsCreated.map((product) => {
      return {
        id: product.id,
        images: product.images,
        name: product.name,
        description: product.description,
      };
    });

    for (const product of products) {
      await Promise.all([
        this.woocommerceIntegration.createMedia(product, pool),
      ]);
    }
    MysqlConnection.endConnection(pool);
    CustomLogger.info(`[WoocommerceService - updateProductWithImage]  end job`);

    return products;
  }

  async handlerWebhookExecution(webhook: any, headers: Headers): Promise<any> {
    if (headers['x-wc-webhook-topic'] === headersTopicEnum.UPDATED) {
      return await this.vetorCreateOrderUseCase.execute(webhook);
    }

    return;
  }

  async updateProductRoutine() {
    CustomLogger.info(`[WoocommerceService - updateProductRoutine]  Start job`);

    const pool: mysql.Pool = await MysqlConnection.connect();

    const productsFromWooCommerce =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);

    const getProductsWithoutImage = productsFromWooCommerce.filter(
      (product) => !product.thumbnail,
    );

    const mongoProducts = (
      await this.productRepository.getProductsBySku(
        getProductsWithoutImage.map((prod) => prod.sku),
      )
    ).slice(0, 10);
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
      message: 'product updated successfully',
    };
  }

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
    while (retry < 3) {
      const notFoundProducts =
        await this.getProductsFromWoocommerceUseCase.execute(
          pool,
          getProductsWithoutImageWrongImage.map((product) => product.sku),
        );
      const needRetry = JSON.parse(
        JSON.stringify(
          notFoundProducts.some((product) => product.thumbnail === '5934'),
        ),
      );
      if (needRetry) {
        const retryMongoProducts =
          await this.productRepository.getProductsBySku(
            notFoundProducts
              .filter((prod) => prod.thumbnail === '5934')
              .map((prd) => prd.sku),
          );
        const scrapImageToProductOnWoocommerce =
          await this.scrapImagesUseCase.execute(retryMongoProducts, retry);

        const updateDocs = scrapImageToProductOnWoocommerce.map((mongoPrd) => {
          const wooProduct = getProductsWithoutImageWrongImage.find(
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
