import * as messages from '@common/messages/response-messages.json';
import { webhookStatusEnum } from '@core/application/dto/enum/webhook-status.enum';
import { OrderRepository } from '@core/infra/db/repositories/mongo/order.repository';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatedOrderStatus {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly vetorIntegration: VetorIntegrationGateway,
    private readonly woocommerceIntegration: WoocommerceIntegration,
  ) {}

  async execute(): Promise<any> {
    const ordersFromDb = await this.orderRepository.findAll();
    if (!ordersFromDb.length) {
      return this.emptyCallbackResponse(ordersFromDb.length);
    }

    const ordersToUpdate = [];
    for (const order of ordersFromDb) {
      const orderFromVetor = await this.vetorIntegration.getOrderInfo(
        { numeroPedido: order.numeroPedido, cdOrcamento: order.cdOrcamento },
        '/pedidos/status',
      );
      if (orderFromVetor.data.cdOrcamento === 0) {
        continue;
      }

      const { data } = orderFromVetor;
      if (orderFromVetor.data?.situacao === 6) {
        ordersToUpdate.push({
          id: data.numeroPedido,
          status: webhookStatusEnum.COMPLETED,
        });
      } else if (orderFromVetor.data?.situacao === 8)
        ordersToUpdate.push({
          id: data.numeroPedido,
          status: webhookStatusEnum.CANCELLED,
        });
    }

    const chunks = ChunckData(ordersToUpdate);
    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateOrderBatch(chunk);
      await this.orderRepository.updateOrderBatch(chunk);
    }
    if (!ordersToUpdate.length) {
      return this.emptyCallbackResponse(ordersToUpdate.length);
    }

    return {
      count: ordersToUpdate.length,
      status: 200,
      message: messages.woocommerce.order.update.success,
    };
  }

  private emptyCallbackResponse(count: number) {
    return {
      count,
      status: 200,
      message: 'Cannot find any order to update',
    };
  }
}
