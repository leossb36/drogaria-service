import { GetProductVetorUseCase } from '@core/application/use-cases/vetor/getProductVetor.use-case';
import { GoogleApiIntegrationGateway } from '@core/infra/integration/google-api.integration';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  providers: [
    GetProductVetorUseCase,
    VetorIntegrationGateway,
    GoogleApiIntegrationGateway,
  ],
  controllers: [VetorIntegrationController],
})
export class VetorModule {}
