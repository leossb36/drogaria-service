import { CreateOrderDto } from '@core/application/dto/createOrder.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import * as messages from '@common/messages/response-messages.json';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationHelper } from '@core/utils/validation-helper';
import { CreateOrderInformationModelView } from '@core/application/mv/createOrderInformation.mv';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(dto: CreateOrderDto): Promise<CreateOrderInformationModelView> {
    const order = await this.integration.createOrder(dto, '/pedidos');

    const { status, data } = order;

    if (!ValidationHelper.isOk(status)) {
      throw new BadRequestException('Cannot create order');
    }

    return {
      data,
      msg: messages.vetor.integration.create.order.success,
      status,
    };
  }
}
