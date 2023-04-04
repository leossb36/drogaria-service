import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { CreateProductsJsonUseCase } from '@core/application/use-cases/vetor/create-products-json.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/get-product.use-case';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { Order, OrderSchema } from '@core/infra/db/schema/order.schema';
import { IntegrationModule } from '@core/infra/integration.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  imports: [
    IntegrationModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  providers: [
    CreateOrderUseCase,
    GetOrderUseCase,
    GetProductUseCase,
    CreateProductsJsonUseCase,
    OrderRepository,
  ],
  controllers: [VetorIntegrationController],
  exports: [CreateOrderUseCase, OrderRepository, CreateProductsJsonUseCase],
})
export class VetorModule {}
