import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(): Promise<any> {
    const products = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      {
        $filter: `cdFilial eq 1 and nomeCategoria ne 'NAO DEFINIDO' and qtdEstoque gt 0`,
        $count: 'true',
      },
    );

    const { data, total } = products;

    if (!data.length) {
      throw new BadRequestException('Cannot find any product');
    }

    return {
      total,
      data,
    };
  }
}
