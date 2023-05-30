import { Injectable } from '@nestjs/common';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';

@Injectable()
export class GetOrderOnDataBaseUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<any> {
    const orders = await this.orderRepository.findAll();

    if (!orders.length) {
      return [];
    }

    return orders;
  }
}
