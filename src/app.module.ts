import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';
import { InfraModule } from '@config/infra.module';
import { WoocommerceModule } from '@core/woocommerce/woocommerce.module';
import { AuthModule } from '@core/auth/auth.module';
import { HealthCheckController } from '@core/healthcheck/healthcheck.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@config/configuration.config';

const config = new ConfigService().get('mongo');

const restImports = [
  MongooseModule.forRoot(
    `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.db}?retryWrites=true&w=majority`,
  ),
  SwaggerModule,
  InfraModule,
  VetorModule,
  WoocommerceModule,
  AuthModule,
];

@Module({
  imports: [...restImports],
  controllers: [HealthCheckController],
})
export class AppModule {}
