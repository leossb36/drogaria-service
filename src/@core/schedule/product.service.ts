import CustomLogger from '@common/logger/logger';
import { SaveProductStreamUseCase } from '@core/vetor/use-case/save-product-vetor-stream.use-case';
import { WoocommerceService } from '@core/woocommerce/woocomerce.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  constructor(
    private readonly saveProductStreamUseCase: SaveProductStreamUseCase,
    private readonly woocommerceService: WoocommerceService,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async productRoutine() {
    CustomLogger.info(`[ProductService - createProductJsonData]  Start job`);
    await this.saveProductStreamUseCase.execute();
    CustomLogger.info(`[ProductService - createProductJsonData]  End job`);

    CustomLogger.info(
      `[ProductService - productRoutine - deleteProducts]  Start job`,
    );
    await this.woocommerceService.deleteProducts();
    CustomLogger.info(
      `[ProductService - productRoutine - deleteProducts]  end job`,
    );

    CustomLogger.info(
      `[ProductService - productRoutine - updateProducts]  Start job`,
    );
    await this.woocommerceService.updateProducts();
    CustomLogger.info(
      `[ProductService - productRoutine - updateProducts]  End job`,
    );

    CustomLogger.info(
      `[ProductService - productRoutine - createProducts]  Start job`,
    );
    await this.woocommerceService.createProductRoutineOnWoocommerce();
    CustomLogger.info(
      `[ProductService - productRoutine - createProducts]  End job`,
    );
  }

  @Cron('0 */5 * * * *')
  async updateImageProduct() {
    CustomLogger.info(
      `[ProductService - updateImageProduct - createProductsOnDb]  Start job`,
    );
    await this.woocommerceService.createProductsOnDb();
    CustomLogger.info(
      `[ProductService - updateImageProduct - createProductsOnDb]  End job`,
    );

    CustomLogger.info(
      `[ProductService - updateImageProduct - scrapImages]  Start job`,
    );
    await this.woocommerceService.scrapImages();
    CustomLogger.info(
      `[ProductService - updateImageProduct - scrapImages]  End job`,
    );

    CustomLogger.info(
      `[ProductService - updateImageProduct - updateImageProduct]  Start job`,
    );
    await this.woocommerceService.updateImageProduct();
    CustomLogger.info(
      `[ProductService - updateImageProduct - updateImageProduct]  End job`,
    );
  }
}
