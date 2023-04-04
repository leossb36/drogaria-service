import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdateProductBatchUseCase } from '@core/application/use-cases/woocommerce/update-batch-product.use-case';
import { UpdatedOrderStatus } from '@core/application/use-cases/woocommerce/update-order-status.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { ReadStreamService } from '@core/utils/read-stream';
import { VetorModule } from '@core/vetor/vetor.module';
import { Module } from '@nestjs/common';
import { WoocommerceService } from './woocomerce.service';
import { WoocommerceController } from './woocommerce.controller';

@Module({
  imports: [VetorModule, IntegrationModule],
  providers: [
    CreateProductUseCase,
    CreateCategoryUseCase,
    GetProductUseCase,
    CreateOrderUseCase,
    UpdateProductUseCase,
    UpdateProductBatchUseCase,
    WoocommerceService,
    ReadStreamService,
    UpdatedOrderStatus,
  ],
  controllers: [WoocommerceController],
})
export class WoocommerceModule {}
