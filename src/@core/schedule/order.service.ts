import CustomLogger from '@common/logger/logger';
import { UpdatedOrderStatus } from '@core/application/use-cases/woocommerce/update-order-status.use-case';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(private readonly updatedOrderStatus: UpdatedOrderStatus) {}

  @Cron('0 */5 * * * *')
  async updateOrder() {
    CustomLogger.info(`[OrderService - updateOrder]  Start job`);
    const orderStatus = this.updatedOrderStatus.execute();
    const result = Promise.resolve(await orderStatus);
    CustomLogger.info(`[OrderService - updateOrder]  End job`);
    return result;
  }
}
