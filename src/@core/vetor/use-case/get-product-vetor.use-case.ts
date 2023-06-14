import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { ObjectHelper } from '@core/utils/object-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductVetorUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(code: string): Promise<any> {
    const product = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      {
        $filter: `cdFilial eq 1 and cdProduto eq ${code}`,
      },
    );

    const { data } = product;

    if (!data.length) {
      throw new BadRequestException('Cannot find any product');
    }

    return ObjectHelper.arrayToObject(data);
  }
}
