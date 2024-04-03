import CustomLogger from '@common/logger/logger';
import { OrderService } from '@core/order/order.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderSchedule {
  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendOrderToVetor(): Promise<any> {
    CustomLogger.info(`[OrderService - sendOrderToVetor]  Start job`);
    await this.orderService.createOrder();
    CustomLogger.info(`[OrderService - sendOrderToVetor]  End job`);

    CustomLogger.info(`[OrderService - updateOrders]  Start job`);
    await this.orderService.updateOrder();
    CustomLogger.info(`[OrderService - updateOrders]  End job`);
  }
}
