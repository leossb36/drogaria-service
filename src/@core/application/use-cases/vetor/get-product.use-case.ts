import { Injectable } from '@nestjs/common';
import { GetProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { Product } from '@core/infra/integration/model/product.model';

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly integration: VetorIntegrationGateway,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(query?: GetProductVetorDto): Promise<Product[]> {
    const request = await this.integration.getProductInfo(
      '/produtos/consulta',
      query,
    );

    const { status, data } = request;

    if (!data.length || !ValidationHelper.isOk(status)) {
      return;
    }

    const products: Product[] = [];
    for (const product of data) {
      const image = await this.searchEngine.getImageUrl(product.descricao);

      products.push({
        ...product,
        imageUrl: image,
      });
    }

    return products;
  }
}
