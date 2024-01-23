import CustomLogger from '@common/logger/logger';
import { VetorService } from '@core/vetor/vetor.service';
import { WoocommerceService } from '@core/woocommerce/woocomerce.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    private readonly woocommerceService: WoocommerceService,
    private readonly vetorService: VetorService,
  ) {}

  @Cron('40 */1 7-23 * * *')
  async sendOrderToVetor(): Promise<any> {
    CustomLogger.info(`[OrderService - sendOrderToVetor]  Start job`);
    await this.vetorService.saveOrderVetor();
    CustomLogger.info(`[OrderService - sendOrderToVetor]  End job`);

    CustomLogger.info(`[OrderService - updateOrders]  Start job`);
    await this.woocommerceService.updateOrders();
    CustomLogger.info(`[OrderService - updateOrders]  End job`);
  }
}
