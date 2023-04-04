import CustomLogger from '@common/logger/logger';
import { CreateProductsJsonUseCase } from '@core/application/use-cases/vetor/create-products-json.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly createProductsJsonUseCase: CreateProductsJsonUseCase,
  ) {}

  @Cron('0 0 2 20 * *')
  async fetchAllProducts() {
    CustomLogger.info(`[ProductService - fetchAllProductData]  Start job`);
    const scrapedProducts = this.createProductUseCase.execute();
    const result = Promise.resolve(await scrapedProducts);
    CustomLogger.info(`[ProductService - fetchAllProductData]  End job`);
    return result;
  }

  @Cron('0 */5 * * * *')
  async updateProductStock() {
    CustomLogger.info(`[ProductService - updateProductData]  Start job`);
    const products = this.updateProductUseCase.execute();
    const result = Promise.resolve(await products);
    CustomLogger.info(`[ProductService - updateProductData]  End job`);
    return result;
  }

  @Cron('0 0 0 20 * *')
  async createProductJsonData() {
    CustomLogger.info(`[ProductService - createProductJsonData]  Start job`);
    const promiseFile = this.createProductsJsonUseCase.execute();
    const result = Promise.resolve(await promiseFile);
    CustomLogger.info(`[ProductService - createProductJsonData]  End job`);
    return result;
  }
}
