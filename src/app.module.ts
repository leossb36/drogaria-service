import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';
import { InfraModule } from '@config/infra.module';
import { WoocommerceModule } from '@core/woocommerce/woocommerce.module';
import { AuthModule } from '@core/auth/auth.module';
import { HealthCheckController } from '@core/healthcheck/healthcheck.controller';

const restImports = [
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
