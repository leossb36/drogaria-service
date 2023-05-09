import CustomLogger from '@common/logger/logger';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { SendOrderToVetorUseCase } from '@core/application/use-cases/vetor/send-order-to-vetor.use-case';
import { UpdatedOrderStatus } from '@core/application/use-cases/woocommerce/update-order-status.use-case';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    private readonly updatedOrderStatus: UpdatedOrderStatus,
    private readonly sendOrderToVetorUseCase: SendOrderToVetorUseCase,
  ) {}

  // @Cron('0 */5 * * * *')
  async updateOrder() {
    CustomLogger.info(`[OrderService - updateOrder]  Start job`);
    const orderStatus = this.updatedOrderStatus.execute();
    const result = Promise.resolve(await orderStatus);
    CustomLogger.info(`[OrderService - updateOrder]  End job`);
    return result;
  }

  // @Cron('40 */1 * * * *')
  async sendOrderToVetor(): Promise<any> {
    CustomLogger.info(`[OrderService - sendOrderToVetor]  Start job`);
    const result = await this.sendOrderToVetorUseCase.execute();
    CustomLogger.info(`[OrderService - sendOrderToVetor]  End job`);
    return result;
  }
}
