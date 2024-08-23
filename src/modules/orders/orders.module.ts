import { PrismaModule } from '@app/infra/db/prisma/prisma.module'
import { OrderRepository } from './repositories/order.repository'
import { OrderController } from './controllers/orders.controller'
import { SharedModule } from '../shared/service/shared.module'
import { OrderSchedule } from './schedules/order.schedule'
import { OrderService } from './services/orders.service'
import { Global, Module } from '@nestjs/common'

@Global()
@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderSchedule]
})
export class OrderModule {}
