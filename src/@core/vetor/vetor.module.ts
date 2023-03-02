import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GoogleApiIntegrationGateway } from '@core/infra/integration/google-api.integration';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  providers: [
    CreateOrderUseCase,
    GetOrderUseCase,
    VetorIntegrationGateway,
    GoogleApiIntegrationGateway,
    SerpApiIntegration,
  ],
  controllers: [VetorIntegrationController],
  exports: [VetorIntegrationGateway, CreateOrderUseCase],
})
export class VetorModule {}
