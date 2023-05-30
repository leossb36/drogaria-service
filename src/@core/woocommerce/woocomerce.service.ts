import { CreateProductWithImagesOnWoocommerce } from './use-case/create-product-with-images-woocommerce.use-case';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import MysqlConnection from '@config/mysql.config';
import { BadRequestException, Injectable } from '@nestjs/common';
import CustomLogger from '@common/logger/logger';
import * as mysql from 'mysql2/promise';
import { Cron } from '@nestjs/schedule';
import { GetOrderOnDataBaseUseCase } from './use-case/get-order-on-database.use-case';
import { UpdatedOrderStatusUseCase } from './use-case/update-order-status.use-case';
import { GetOrderVetorUseCase } from '@core/vetor/use-case/get-order-vetor.use-case';
import { ValidationHelper } from '@core/utils/validation-helper';
import { StatusEnum } from '@core/common/enum/status.enum';

@Injectable()
export class WoocommerceService {
  constructor(
    private readonly createProductWithImagesOnWoocommerce: CreateProductWithImagesOnWoocommerce,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly getOrderOnDataBaseUseCase: GetOrderOnDataBaseUseCase,
    private readonly getOrderOnVetorUseCase: GetOrderVetorUseCase,
    private readonly updateOrderStatusUseCase: UpdatedOrderStatusUseCase,
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
      await MysqlConnection.endConnection(pool);
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
    await MysqlConnection.endConnection(pool);
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
    CustomLogger.info(`[WoocommerceService - retryScrapNewImage]  End job`);
    await MysqlConnection.endConnection(pool);

    return {
      count: mongoProducts.length,
      ids: getProductsWithoutImageWrongImage.map((product) => product.id),
      message: 'Products updated successfully!',
    };
  }

  async updateOrders() {
    try {
      const ordersOnDataBase = await this.getOrderOnDataBaseUseCase.execute();

      if (!ordersOnDataBase.length) {
        return this.emptyCallbackResponse(ordersOnDataBase.length);
      }

      const ordersToUpdate = [];
      for (const order of ordersOnDataBase) {
        const { numeroPedido, cdOrcamento } = order;
        const orderFromVetor = await this.getOrderOnVetorUseCase.execute({
          numeroPedido,
          cdOrcamento,
        });

        if (
          !orderFromVetor ||
          orderFromVetor?.cdOrcamento === StatusEnum.NOT_FOUND
        ) {
          continue;
        }

        ordersToUpdate.push(
          ValidationHelper.setStatus(orderFromVetor, order.numeroPedido),
        );
      }
      return await this.updateOrderStatusUseCase.execute(ordersToUpdate);
    } catch (error) {
      throw new BadRequestException('Cannot update orders', error);
    }
  }

  private emptyCallbackResponse(count: number) {
    return {
      count,
      status: 200,
      message: 'Cannot find any order to update',
    };
  }
}
