import { HealthCheckController } from '@core/healthcheck/healthcheck.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@config/configuration.config';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { InfraModule } from '@config/infra.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from '@core/order/order.module';
import { ProductModule } from '@core/product/product.module';
import { StreamModule } from '@core/stream/stream.module';

const config = new ConfigService().get('mongo');

const restImports = [
  MongooseModule.forRoot(
    `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.db}?retryWrites=true&w=majority`,
  ),
  SwaggerModule,
  InfraModule,
  OrderModule,
  ProductModule,
  StreamModule,
];

@Module({
  imports: [ScheduleModule.forRoot(), ...restImports],
  controllers: [HealthCheckController],
})
export class AppModule {}
