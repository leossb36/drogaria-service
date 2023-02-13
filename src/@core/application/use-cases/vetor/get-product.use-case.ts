import { Injectable } from '@nestjs/common';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import { GetProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import * as messages from '@common/messages/response-messages.json';
import { Product } from '@core/infra/integration/model/product.model';
import { GoogleApiIntegrationGateway } from '@core/infra/integration/google-api.integration';

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly integration: VetorIntegrationGateway,
    private readonly searchEngine: GoogleApiIntegrationGateway,
  ) {}

  async execute(
    query: GetProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    const request = await this.integration.getProductInfo(
      query,
      '/produtos/consulta',
    );

    const { status, data, total } = request;

    if (!data.length || !ValidationHelper.isOk(status)) {
      return;
    }

    const products: Product[] = [];
    for (const product of data) {
      const productName = product.descricao.split(' ');
      const imageUrl = await this.searchEngine.getImageProduct(productName[0]);

      products.push({
        ...product,
        imageUrl,
      });
    }

    return {
      data: products,
      msg: messages.vetor.integration.get.success,
      status,
      total,
    };
  }
}
