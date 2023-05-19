import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetOrderDto } from '../dto/get-order.dto';
import { GetOrderInformationModelView } from '../mv/get-order-information.mv';

@Injectable()
export class GetOrderVetorUseCase {
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
