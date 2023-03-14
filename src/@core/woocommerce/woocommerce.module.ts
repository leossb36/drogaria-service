import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdateProductBatchUseCase } from '@core/application/use-cases/woocommerce/update-batch-product.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { VetorModule } from '@core/vetor/vetor.module';
import { Module } from '@nestjs/common';
import { WoocommerceService } from './woocomerce.service';
import { WoocommerceController } from './woocommerce.controller';

@Module({
  imports: [VetorModule],
  providers: [
    CreateProductUseCase,
    CreateCategoryUseCase,
    GetProductUseCase,
    CreateOrderUseCase,
    UpdateProductUseCase,
    UpdateProductBatchUseCase,
    WoocommerceIntegration,
    WoocommerceService,
    SerpApiIntegration,
  ],
  controllers: [WoocommerceController],
})
export class WoocommerceModule {}
