import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Order, OrderSchema } from '@core/infra/db/schema/order.schema';
import { IntegrationModule } from '@core/infra/integration.module';
import { WordpressModule } from '@core/wordpress/wordpress.module';
import { GetProductVetorUseCase } from './use-case/get-product.use-case';
import { GetOrderVetorUseCase } from './use-case/get-order.use-case';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { OrderService } from './order.service';
import { CreateOrderUseCase } from './use-case/create-order.use-case';
import { OrderSchedule } from '@core/schedule/order.schedule';
import { PutOrderUseCase } from './use-case/put-order.use-case';
import { GetOrderOnDataBaseUseCase } from './use-case/get-order-on-database.use-case';
import { UpdatedOrderStatusUseCase } from './use-case/update-order-status.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    IntegrationModule,
    WordpressModule,
  ],
  providers: [
    CreateOrderUseCase,
    PutOrderUseCase,
    GetProductVetorUseCase,
    GetOrderVetorUseCase,
    OrderRepository,
    OrderService,
    OrderSchedule,
    GetOrderOnDataBaseUseCase,
    UpdatedOrderStatusUseCase,
  ],
  exports: [
    CreateOrderUseCase,
    PutOrderUseCase,
    GetProductVetorUseCase,
    GetOrderVetorUseCase,
    OrderRepository,
    OrderService,
    OrderSchedule,
    GetOrderOnDataBaseUseCase,
    UpdatedOrderStatusUseCase,
  ],
})
export class OrderModule {}
