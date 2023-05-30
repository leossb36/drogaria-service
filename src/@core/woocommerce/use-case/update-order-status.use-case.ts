import * as messages from '@common/messages/response-messages.json';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { Injectable } from '@nestjs/common';
import { ObjectHelper } from '@core/utils/object-helper';
import { FinishStatusEnum } from '@core/common/enum/woocommerce-status.enum';

@Injectable()
export class UpdatedOrderStatusUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(orders: any): Promise<any> {
    const chunks = ChunckData(orders);
    for (const chunk of chunks) {
      const cpChunk = JSON.parse(JSON.stringify(chunk));
      await Promise.all([
        this.woocommerceIntegration.updateOrderBatch(chunk),
        this.orderRepository.updateOrderBatch(
          cpChunk
            .filter((order) =>
              Object.values(FinishStatusEnum).includes(order.status),
            )
            .map((ck) => ObjectHelper.changeKey(ck, 'numeroPedido', 'id')),
        ),
      ]);
    }

    return {
      count: orders.length,
      status: 200,
      message: messages.woocommerce.order.update.success,
    };
  }
}
