import { Injectable } from '@nestjs/common';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import * as messages from '@common/messages/response-messages.json';

@Injectable()
export class GetProductVetorUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(
    query: getProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    const request = await this.integration.getProductInfo(
      query,
      '/produtos/consulta',
    );

    const { status, data, total } = request;

    if (!data.length || !ValidationHelper.isOk(status)) {
      return;
    }

    return {
      data,
      msg: messages.vetor.integration.get.success,
      status,
      total,
    };
  }
}
