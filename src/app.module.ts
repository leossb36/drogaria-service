import { HealthCheckController } from './modules/healthcheck/healthcheck.controller'
import { DbInterceptor } from './common/interceptors/db.interceptor'
import { ProductModule } from './modules/products/products.module'
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown'
import { PrismaModule } from './infra/db/prisma/prisma.module'
import { SwaggerModule } from '@common/swagger/swagger.module'
import { OrderModule } from './modules/orders/orders.module'
import { InfraModule } from '@config/infra.module'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    InfraModule,
    SwaggerModule,
    OrderModule,
    ProductModule,
    PrismaModule
  ],
  controllers: [HealthCheckController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DbInterceptor
    }
  ]
})
export class AppModule {}
