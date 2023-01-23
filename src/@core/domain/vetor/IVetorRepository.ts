import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';

export const VetorIntegrationRepositoryKey = 'IVetorIntegrationRepository';
export interface IVetorIntegrationRepository {
  findProducts(
    query: getProductVetorDto,
  ): Promise<GetProductInformationModelView>;
}
