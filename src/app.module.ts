import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';
import { InfraModule } from '@config/infra.module';
import { WoocommerceModule } from '@core/woocommerce/woocommerce.module';

const restImports = [
  SwaggerModule,
  InfraModule,
  VetorModule,
  WoocommerceModule,
];

@Module({
  imports: [...restImports],
})
export class AppModule {}
