import CustomLogger from '@common/logger/logger';
import { headersTopicEnum } from '@core/application/dto/enum/headers-topic.enum';
import { webhookStatusEnum } from '@core/application/dto/enum/webhook-status.enum';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { CreateProductOnWoocommerce } from '@core/application/use-cases/woocommerce/create-product-woocommerce.use-case';
import { ScrapImagesUseCase } from '@core/application/use-cases/woocommerce/scrap-image-to-product.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WoocommerceService {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorCreateOrderUseCase: CreateOrderUseCase,
    private readonly createProductOnWoocommerce: CreateProductOnWoocommerce,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async createProductRoutineOnMongo() {
    const products = await this.productRepository.findProductsWithoutImage(20);

    const scrapImagesProducts = await this.scrapImagesUseCase.execute(products);

    return {
      mongo: scrapImagesProducts.length,
      message: 'product created successfully',
    };
  }

  // @Cron('0 */5 * * * *')
  async createProductRoutineOnWoocommerce() {
    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  Start job`,
    );
    const [products] = await Promise.all([
      this.createProductOnWoocommerce.execute(),
    ]);

    if (!products.length) {
      return {
        data: [],
        message: 'Cannot find any products to create on woocommerce',
      };
    }
    CustomLogger.info(
      `[WoocommerceService - createProductRoutineOnWoocommerce]  End job`,
    );
    return {
      mongo: products.length,
      message: 'product created successfully',
    };
  }

  @Cron('0 */8 * * * *')
  async updateProductRoutine() {
    CustomLogger.info(`[WoocommerceService - updateProductRoutine]  Start job`);
    const productsOnWoocommerce =
      await this.woocommerceIntegration.getProductsWithoutImage();

    const getProductsBySku = await this.productRepository.getProductsBySku(
      productsOnWoocommerce.map((product) => {
        return { sku: product.sku };
      }),
    );

    const updates = getProductsBySku.map((mongoProduct) => {
      const wooProduct = productsOnWoocommerce.find(
        (wooProd) => wooProd.sku === mongoProduct.sku,
      );
      return {
        id: wooProduct.id,
        images: mongoProduct.images,
      };
    });

    const insertData = await this.woocommerceIntegration.updateProductBatch(
      updates,
    );

    const errors = insertData.data.update.filter((row) => row.error);

    const notfound = await this.woocommerceIntegration.updateProductBatch(
      errors.map((row) => ({
        id: row.id,
        images: [
          {
            src: 'https://farmacialuita.com.br/wp-content/uploads/2023/04/558-5585968_thumb-image-not-found-icon-png-transparent-png.png',
          },
        ],
      })),
    );

    await this.productRepository.updateProductBatch(
      notfound.data.update.map((row) => row),
    );
    CustomLogger.info(`[WoocommerceService - updateProductRoutine]  Start job`);
    return {
      woocommerce: insertData.data.length,
      message: 'product created successfully',
    };
  }

  async handlerWebhookExecution(webhook: any, headers: Headers): Promise<any> {
    if (
      headers['x-wc-webhook-topic'] === headersTopicEnum.UPDATED &&
      webhook.status === webhookStatusEnum.PROCESSING
    ) {
      return await this.vetorCreateOrderUseCase.execute(webhook);
    }

    return;
  }
}
