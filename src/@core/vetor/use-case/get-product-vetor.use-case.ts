import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductVetorUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(productId: number): Promise<any> {
    const product = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      {
        $filter: `cdFilial eq 1 and cdProduto eq ${productId}`,
      },
    );

    const { data, total } = product;

    if (!data.length) {
      throw new BadRequestException('Cannot find any product');
    }

    return {
      total,
      data,
    };
  }
}
