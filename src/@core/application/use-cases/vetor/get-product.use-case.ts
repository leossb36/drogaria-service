import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(): Promise<any> {
    const products = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      {
        $filter: 'cdFilial eq 1',
      },
    );

    const { data } = products;

    if (!data.length) {
      throw new BadRequestException('Cannot find any product');
    }

    return data;
  }
}
