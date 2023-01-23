import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { IVetorIntegrationRepository } from '@core/domain/vetor/IVetorRepository';
import { VetorIntegrationGateway } from '@infra/integration/vetor.integration';

export class VetorIntegrationRepository implements IVetorIntegrationRepository {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async findProducts(query: getProductVetorDto) {
    return await this.integration.get(query, '/produtos/consulta');
  }
}
