import CustomLogger from '@common/logger/logger';
import { ProductService } from '@core/product/product.service';
import { StreamService } from '@core/stream/stream.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductSchedule {
  constructor(
    private readonly productService: ProductService,
    private readonly streamService: StreamService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateStreamFile() {
    CustomLogger.info(
      `[ProductService - productRoutine - saveProductStream]  Start job`,
    );
    await this.streamService.createStream();

    CustomLogger.info(
      `[ProductService - productRoutine -saveProductStream]  End job`,
    );

    CustomLogger.info(
      `[ProductService - productRoutine - createProducts]  Start job`,
    );

    await this.productService.createProducts();
    CustomLogger.info(
      `[ProductService - productRoutine - createProducts]  End job`,
    );
  }

  @Cron('0 */17 * * * *')
  async productRoutine() {
    CustomLogger.info(
      `[ProductService - productRoutine - saveProductStream]  Start job`,
    );
    await this.streamService.createStream();

    CustomLogger.info(
      `[ProductService - productRoutine -saveProductStream]  End job`,
    );

    CustomLogger.info(
      `[ProductService - productRoutine - updateProducts]  Start job`,
    );
    await this.productService.updateProducts();
    CustomLogger.info(
      `[ProductService - productRoutine - updateProducts]  End job`,
    );
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateImageProduct() {
    CustomLogger.info(
      `[ProductService - updateImageProduct - scrapImages]  Start job`,
    );
    await this.productService.scrapImages();
    CustomLogger.info(
      `[ProductService - updateImageProduct - scrapImages]  End job`,
    );

    CustomLogger.info(
      `[ProductService - updateImageProduct - updateImageProduct]  Start job`,
    );
    await this.productService.updateImageProduct();
    CustomLogger.info(
      `[ProductService - updateImageProduct - updateImageProduct]  End job`,
    );
  }
}
