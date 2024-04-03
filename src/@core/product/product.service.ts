import { Injectable } from '@nestjs/common';
import { UpdateImageProductUseCase } from './use-case/update-image-product.use-case';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';
import { ChunckData } from '@core/utils/fetch-helper';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { PutProductUseCase } from './use-case/put-product.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { StreamService } from '@core/stream/stream.service';
import { GetProductWoocommerceModelView } from './mv/get-product-woo.mv';
import { ProductAdapter } from './product.adapter';
import { PutSkuUseCase } from './use-case/put-sku.use-case';

@Injectable()
export class ProductService {
  constructor(
    private readonly updateImageProductUseCase: UpdateImageProductUseCase,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly putProductUseCase: PutProductUseCase,
    private readonly productRepository: ProductRepository,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
    private readonly streamService: StreamService,
    private readonly productAdapter: ProductAdapter,
    private readonly putSkuUseCase: PutSkuUseCase,
  ) {}

  async createProducts(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const [streamData, woocommerceProducts] = await Promise.all([
      this.streamService.getStreamBuilt(),
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

  async updateProducts(): Promise<void> {
    const [streamProducts, wooProducts] = await Promise.all([
      this.streamService.getStream(),
      this.woocommerceIntegration.getAllProducts(),
    ]);

    const putProducts: GetProductWoocommerceModelView[] = [];

    for (const item of streamProducts) {
      const foundProduct = wooProducts.find(
        (product) => item.cdProduto === Number(product.sku),
      );

      if (foundProduct && item.qtdEstoque > 0) {
        putProducts.push(this.productAdapter.update(foundProduct, item));
      } else if (foundProduct && item.qtdEstoque <= 0) {
        putProducts.push(this.productAdapter.draft(foundProduct, item));
      } else {
        continue;
      }
    }

    await this.putProductUseCase.execute(putProducts);
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

  async updateImageProduct(): Promise<any> {
    return await this.updateImageProductUseCase.execute();
  }

  async putSkuProducts(): Promise<number> {
    const response = await this.putSkuUseCase.execute();

    if (!response) {
      return 0;
    }

    return response;
  }
}
