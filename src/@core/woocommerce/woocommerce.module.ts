import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { VetorModule } from '@core/vetor/vetor.module';
import { Module } from '@nestjs/common';
import { WoocommerceController } from './woocommerce.controller';

@Module({
  imports: [VetorModule],
  providers: [
    CreateProductUseCase,
    GetProductUseCase,
    CreateOrderUseCase,
    CreateCategoryUseCase,
    WoocommerceIntegration,
  ],
  controllers: [WoocommerceController],
})
export class WoocommerceModule {}
