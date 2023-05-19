import CustomLogger from '@common/logger/logger';
import { SaveOrderVetorUseCase } from '@core/vetor/use-case/save-order-vetor.use-case';
import { UpdatedOrderStatus } from '@core/woocommerce/use-case/update-order-status.use-case';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    private readonly updatedOrderStatus: UpdatedOrderStatus,
    private readonly saveOrderVetorUseCase: SaveOrderVetorUseCase,
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
    const result = await this.saveOrderVetorUseCase.execute();
    CustomLogger.info(`[OrderService - sendOrderToVetor]  End job`);
    return result;
  }
}
