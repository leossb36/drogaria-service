import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { Injectable } from '@nestjs/common';
import { GetOrderDto } from '../dto/get-order.dto';
import { GetOrderInformationModelView } from '../mv/get-order-information.mv';

@Injectable()
export class GetOrderVetorUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(query: GetOrderDto): Promise<GetOrderInformationModelView> {
    try {
      const response = await this.integration.getOrderInfo(
        query,
        '/pedidos/status',
      );

      return {
        ...response.data.data,
      };
    } catch (error) {
      console.log(error.response.message);
    }
  }
}
