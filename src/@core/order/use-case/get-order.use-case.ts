import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { Injectable } from '@nestjs/common';
import { GetOrderDto } from '../dto/get-order.dto';
import { GetOrderInformationModelView } from '../mv/get-order-information.mv';

@Injectable()
export class GetOrderVetorUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(query: GetOrderDto): Promise<GetOrderInformationModelView> {
    const response = await this.integration.getOrderInfo(
      query,
      '/pedidos/status',
    );

    if (!response) {
      return;
    }

    return {
      ...response.data.data,
    };
  }
}
