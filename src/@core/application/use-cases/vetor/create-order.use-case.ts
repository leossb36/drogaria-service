import { CreateOrderDto } from '@core/application/dto/createOrder.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import * as messages from '@common/messages/response-messages.json';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationHelper } from '@core/utils/validation-helper';
import { CreateOrderInformationModelView } from '@core/application/mv/createOrderInformation.mv';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(dto: CreateOrderDto): Promise<CreateOrderInformationModelView> {
    const order = await this.integration.createOrder(dto, '/pedidos');

    if (!order || !ValidationHelper.isOk(order.status)) {
      throw new BadRequestException('Cannot create order');
    }

    return {
      data: order.data,
      msg: messages.vetor.integration.create.order.success,
      status: order.status,
    };
  }
}
