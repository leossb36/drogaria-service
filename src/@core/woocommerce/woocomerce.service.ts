import { Injectable } from '@nestjs/common';
import { UpdatedOrderStatusUseCase } from './use-case/update-order-status.use-case';
import { RetryScrapImageProductUseCase } from './use-case/retry-create-image-product.use-case';
import { UpdateImageProductUseCase } from './use-case/update-image-product.use-case';
import { ReadStreamVetorUseCase } from '@core/vetor/use-case/read-stream-vetor.use-case';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';
import { ChunckData } from '@core/utils/fetch-helper';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { DeleteProductsUseCase } from './use-case/delete-products.use-case';
import { UpdateAllProductsFromVetor } from './use-case/update-all-products.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { GetWebhookDto } from './dto/webhook.dto';
import { GetOrderUseCase } from '@core/vetor/use-case/get-order.use-case';

@Injectable()
export class WoocommerceService {
  constructor(
    private readonly retryScrapImageProductUseCase: RetryScrapImageProductUseCase,
    private readonly updateImageProductUseCase: UpdateImageProductUseCase,
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly deleteProductsUseCase: DeleteProductsUseCase,
    private readonly updateAllProductsFromVetor: UpdateAllProductsFromVetor,
    private readonly updateOrderStatusUseCase: UpdatedOrderStatusUseCase,
    private readonly productRepository: ProductRepository,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  async createProductRoutineOnWoocommerce(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const [streamData, woocommerceProducts] = await Promise.all([
      this.readStreamVetorUseCase.readFromJson(),
      this.getProductsFromWoocommerceUseCase.execute(pool, []),
    ]);

    await MysqlConnection.endConnection(pool);

    if (!streamData.length) {
      return {
        data: [],
        message: 'Cannot find any products to create on woocommerce',
      };
    }

    const productsToCreate = streamData.filter((stream) => {
      return !woocommerceProducts.some((prd) => prd.sku === stream.sku);
    });

    if (!productsToCreate.length) {
      return {
        data: [],
        message: 'Does not any product to create',
      };
    }

    const chunks = ChunckData(productsToCreate);

    const result = [];
    try {
      for (const chunk of chunks) {
        await this.woocommerceIntegration.createProductBatch(chunk);
        const productInDb = await this.productRepository.getProductsSku(
          chunk.map((product) => product.sku),
        );

        const productsNotInDb = chunk.filter((product) => {
          return !productInDb.some((prod) => prod.sku === product.sku);
        });

        result.push(...chunk);
        if (!productsNotInDb.length) {
          continue;
        } else {
          await this.productRepository.createProductBatch(productsNotInDb);
        }
      }

      return {
        amount: result.length,
        message: 'products created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProducts(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const woocommerceProducts =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);
    await MysqlConnection.endConnection(pool);

    const productsToDelete = await this.deleteProductsUseCase.execute(
      woocommerceProducts,
    );

    if (!productsToDelete.length) {
      return [];
    }

    const chunks = ChunckData(productsToDelete);

    const result = [];
    for (const chunk of chunks) {
      const products = await this.woocommerceIntegration.deactivateProducts(
        chunk,
      );
      result.push(...products.data?.delete);
    }

    return {
      amount: result.length,
      message: 'products deleted successfully',
    };
  }

  async updateProducts(): Promise<any> {
    return await this.updateAllProductsFromVetor.execute();
  }

  async createProductsOnDb(): Promise<any> {
    const productsWithoutImage =
      await this.woocommerceIntegration.getProductsWithoutImageFull();

    const productsInDb = await this.productRepository.findProductsWithoutImage(
      productsWithoutImage.map((product) => product.sku),
      0,
    );
    if (!productsInDb.length) {
      return await this.productRepository.createProductBatch(
        productsWithoutImage,
      );
    }

    const productsWithImageInDb =
      await this.productRepository.findProductsWithImage(
        productsWithoutImage.map((prd) => prd.sku),
        undefined,
      );

    if (productsWithImageInDb.length && productsWithImageInDb.length === 5) {
      return [];
    }

    const productsNotInDd = productsWithoutImage.filter((prd) => {
      return !productsInDb.some((prod) => prod.sku === prd.sku);
    });

    if (!productsNotInDd.length) {
      return [];
    }

    return await this.productRepository.createProductBatch(productsNotInDd);
  }

  async scrapImages(): Promise<any> {
    const productsWithoutImage =
      await this.woocommerceIntegration.getProductsWithoutImage();

    if (!productsWithoutImage.length) {
      return [];
    }

    const productsInDb = await this.productRepository.findProductsWithoutImage(
      productsWithoutImage.map((product) => product.sku),
      5,
    );

    if (!productsInDb.length) {
      const existInDBWithImage =
        await this.productRepository.findProductsWithImage(
          productsWithoutImage.map((product) => product.sku),
          5,
        );

      if (existInDBWithImage.length && existInDBWithImage.length === 5) {
        return [];
      }
      await this.productRepository.createProductBatch(productsWithoutImage);
      return await this.scrapImagesUseCase.execute(productsWithoutImage, 0);
    }
    return await this.scrapImagesUseCase.execute(productsInDb, 0);
  }

  async retryCreateImage(): Promise<any> {
    return await this.retryScrapImageProductUseCase.execute();
  }

  async updateImageProduct(): Promise<any> {
    return await this.updateImageProductUseCase.execute();
  }

  async removeAllWithoutImage(): Promise<any> {
    const productsWithoutImage =
      await this.woocommerceIntegration.getProductsWithoutImageFull();
    const productsInDb = await this.productRepository.findProductsWithoutImage(
      productsWithoutImage.map((product) => product.sku),
      100,
    );

    return await this.productRepository.deleteAll(productsInDb);
  }

  async deleteAllWithoutImage(): Promise<any> {
    return await this.productRepository.deleteAllWithoutImage();
  }

  async updateOrders(webhook: GetWebhookDto): Promise<number> {
    const order = await this.getOrderUseCase.execute(webhook);

    if (!order) {
      return 0;
    }

    const response = await this.woocommerceIntegration.updateOrderStatus(
      order.numeroPedido,
      webhook,
    );

    if (!response) {
      return 0;
    }

    return await this.updateOrderStatusUseCase.execute(response);
  }
}
