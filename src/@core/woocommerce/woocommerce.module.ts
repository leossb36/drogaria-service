import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Module } from '@nestjs/common';
import { WoocommerceController } from './woocommerce.controller';

@Module({
  providers: [CreateProductUseCase, GetProductUseCase, WoocommerceIntegration],
  controllers: [WoocommerceController],
})
export class WoocommerceModule {}
