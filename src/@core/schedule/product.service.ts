import CustomLogger from '@common/logger/logger';
import { SaveProductStreamUseCase } from '@core/vetor/use-case/save-product-vetor-stream.use-case';
import { UpdateAllProductsFromVetor } from '@core/woocommerce/use-case/update-all-products.use-case';
import { UpdateProductUseCase } from '@core/woocommerce/use-case/update-product.use-case';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  constructor(
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly saveProductStreamUseCase: SaveProductStreamUseCase,
    private readonly updateAllProductsFromVetor: UpdateAllProductsFromVetor,
  ) {}

  @Cron('20 */1 * * * *')
  async updateProductStock() {
    CustomLogger.info(`[ProductService - updateProductData]  Start job`);
    const result = await this.updateProductUseCase.execute();
    CustomLogger.info(`[ProductService - updateProductData]  End job`);
    return result;
  }

  @Cron('0 30 0 * * *')
  async updateAllProducts() {
    CustomLogger.info(`[ProductService - updateAllProducts]  Start job`);
    const result = await this.updateAllProductsFromVetor.execute();
    CustomLogger.info(`[ProductService - updateAllProducts]  End job`);
    return result;
  }

  @Cron('0 0 0 * * *')
  async createProductJsonData() {
    CustomLogger.info(`[ProductService - createProductJsonData]  Start job`);
    const result = await this.saveProductStreamUseCase.execute();
    CustomLogger.info(`[ProductService - createProductJsonData]  End job`);
    return result;
  }
}
