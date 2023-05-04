import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { CreateProductsJsonUseCase } from '@core/application/use-cases/vetor/create-products-json.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/get-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VetorIntegrationController } from './vetor.controller';
import { Order, OrderSchema } from '@core/infra/db/schema/mongo/order.schema';
import { OrderRepository } from '@core/infra/db/repositories/mongo/order.repository';
import { GetProductsFromWoocommerceUseCase } from '@core/application/use-cases/wordpress/get-products-from-woocommerce.use-case';

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
    GetProductsFromWoocommerceUseCase,
  ],
  controllers: [VetorIntegrationController],
  exports: [CreateOrderUseCase, OrderRepository, CreateProductsJsonUseCase],
})
export class VetorModule {}
