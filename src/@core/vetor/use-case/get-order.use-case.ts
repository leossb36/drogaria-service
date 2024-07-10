import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { GetWebhookDto } from '@core/woocommerce/dto/webhook.dto';
import { GetOrderModelView } from '@core/woocommerce/mv/get-order.mv';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(webhook: GetWebhookDto): Promise<GetOrderModelView> {
    return await this.orderRepository.getByOrderId(webhook.pedidoId);
  }
}
