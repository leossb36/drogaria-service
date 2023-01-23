import { Inject, Injectable } from '@nestjs/common';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import {
  IVetorIntegrationRepository,
  VetorIntegrationRepositoryKey,
} from '@core/domain/vetor/IVetorRepository';
import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';

@Injectable()
export class GetProductVetorUseCase {
  constructor(
    @Inject(VetorIntegrationRepositoryKey)
    private readonly vetorRepository: IVetorIntegrationRepository,
  ) {}

  async execute(
    query: getProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    const request = await this.vetorRepository.findProducts(query);

    const { status, data, msg, total } = request;

    if (!!data.length) {
      return;
    }

    return {
      status,
      data,
      msg,
      total,
    };
  }
}
