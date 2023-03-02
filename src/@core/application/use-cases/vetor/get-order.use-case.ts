import { GetOrderDto } from '@core/application/dto';
import { GetOrderInformationModelView } from '@core/application/mv/get-order-information.mv';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(query: GetOrderDto): Promise<GetOrderInformationModelView> {
    const request = await this.integration.getOrderInfo(
      query,
      '/pedidos/status',
    );

    const { status, data } = request;

    if (!ValidationHelper.isOk(status)) {
      throw new BadRequestException(
        `Cannot find any order with this id :: ${query.numeroPedido}`,
      );
    }

    return {
      situacao: data.situacao,
      cdOrcamento: data.cdOrcamento,
      mensagem: data.mensagem,
    };
  }
}
