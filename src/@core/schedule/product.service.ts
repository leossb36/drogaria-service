import CustomLogger from '@common/logger/logger';
import { SaveProductStreamUseCase } from '@core/vetor/use-case/save-product-vetor-stream.use-case';
import { WoocommerceService } from '@core/woocommerce/woocomerce.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  constructor(
    private readonly saveProductStreamUseCase: SaveProductStreamUseCase,
    private readonly woocommerceService: WoocommerceService,
  ) {}

  @Cron('0 0 0 * * *')
  async productRoutine() {
    CustomLogger.info(`[ProductService - createProductJsonData]  Start job`);
    await this.saveProductStreamUseCase.execute();
    CustomLogger.info(`[ProductService - createProductJsonData]  End job`);

    CustomLogger.info(
      `[ProductService - productRoutine - deleteProducts]  Start job`,
    );
    await this.woocommerceService.deleteProducts();
    CustomLogger.info(
      `[ProductService - productRoutine - deleteProducts]  Start job`,
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

  @Cron('0 30 2 * * *')
  async scrapImages() {
    CustomLogger.info(`[ProductService - updateImageProduct]  Start job`);
    await this.woocommerceService.scrapImages();
    CustomLogger.info(`[ProductService - updateImageProduct]  End job`);
  }

  @Cron('*/3 3-6 * * *')
  async updateImageProduct() {
    CustomLogger.info(`[ProductService - updateImageProduct]  Start job`);
    await this.woocommerceService.updateImageProduct();
    CustomLogger.info(`[ProductService - updateImageProduct]  End job`);
  }
}
