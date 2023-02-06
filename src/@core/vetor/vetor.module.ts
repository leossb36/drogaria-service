import { CreateOrderUseCase } from '@core/application/use-cases/vetor/createOrder.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/getOrder.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/getProduct.use-case';
import { GoogleApiIntegrationGateway } from '@core/infra/integration/google-api.integration';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  providers: [
    GetProductUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
    VetorIntegrationGateway,
    GoogleApiIntegrationGateway,
  ],
  controllers: [VetorIntegrationController],
})
export class VetorModule {}
