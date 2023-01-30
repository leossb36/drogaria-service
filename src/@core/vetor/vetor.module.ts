import { GetProductVetorUseCase } from '@core/application/use-cases/vetor/getProductVetor.use-case';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  providers: [GetProductVetorUseCase, VetorIntegrationGateway],
  controllers: [VetorIntegrationController],
})
export class VetorModule {}
