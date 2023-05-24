import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { FetchVetorProducts } from '@core/utils/fetch-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SaveProductStreamUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(): Promise<any> {
    try {
      const response = await FetchVetorProducts(this.vetorIntegration);

      return {
        message: 'File created successfully.',
        amount: response,
      };
    } catch (error) {
      throw new BadRequestException('Cannot create fileStream');
    }
  }
}
