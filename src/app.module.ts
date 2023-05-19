import { HealthCheckController } from '@core/healthcheck/healthcheck.controller';
import { WoocommerceModule } from '@core/woocommerce/woocommerce.module';
import { CloudinaryModule } from '@core/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@config/configuration.config';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';
import { InfraModule } from '@config/infra.module';
import { AuthModule } from '@core/auth/auth.module';
import { Module } from '@nestjs/common';

const config = new ConfigService().get('mongo');

const restImports = [
  MongooseModule.forRoot(
    `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.db}?retryWrites=true&w=majority`,
  ),
  WoocommerceModule,
  CloudinaryModule,
  SwaggerModule,
  InfraModule,
  VetorModule,
  AuthModule,
];

@Module({
  imports: [...restImports],
  controllers: [HealthCheckController],
})
export class AppModule {}
