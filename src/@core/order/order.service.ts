import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderUseCase } from './use-case/create-order.use-case';
import { PutOrderUseCase } from './use-case/put-order.use-case';
import { CreateOrderModelView } from './mv/create-order.mv';

@Injectable()
export class OrderService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly putOrderUseCase: PutOrderUseCase,
  ) {}

  async createOrder(): Promise<CreateOrderModelView> {
    const response = await this.createOrderUseCase.execute();

    if (!response) {
      throw new BadRequestException('Cannot save product on vetor');
    }

    return response;
  }

  async updateOrder(): Promise<number> {
    const response = await this.putOrderUseCase.execute();

    if (!response) {
      throw new BadRequestException('Cannot update product on vetor');
    }

    return response;
  }
}
