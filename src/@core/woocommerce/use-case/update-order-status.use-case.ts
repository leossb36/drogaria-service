import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdatedOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(order: any): Promise<number> {
    const response = await this.orderRepository.updateOrder(order);

    if (!response) {
      return 0;
    }

    return response;
  }
}
