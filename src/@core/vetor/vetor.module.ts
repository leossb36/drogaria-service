import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { CreateProductsJsonUseCase } from '@core/application/use-cases/vetor/create-products-json.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/get-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  imports: [IntegrationModule],
  providers: [
    CreateOrderUseCase,
    GetOrderUseCase,
    GetProductUseCase,
    CreateProductsJsonUseCase,
  ],
  controllers: [VetorIntegrationController],
  exports: [CreateOrderUseCase],
})
export class VetorModule {}
