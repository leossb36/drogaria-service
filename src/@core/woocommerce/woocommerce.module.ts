import { CreateProductWithImagesOnWoocommerce } from './use-case/create-product-with-images-woocommerce.use-case';
import { CreateProductOnWoocommerce } from './use-case/create-product-woocommerce.use-case';
import { UpdateAllProductsFromVetor } from './use-case/update-all-products.use-case';
import { CreateCategoryUseCase } from './use-case/create-category.use-case';
import { WoocommerceController } from './woocommerce.controller';
import { UpdateProductUseCase } from './use-case/update-product.use-case';
import { CreateOrderUseCase } from './use-case/create-order.use-case';
import { WoocommerceService } from './woocomerce.service';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { GetProductUseCase } from './use-case/get-product.use-case';
import { WordpressModule } from '@core/wordpress/wordpress.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductService } from '@core/schedule/product.service';
import { OrderService } from '@core/schedule/order.service';
import { VetorModule } from '@core/vetor/vetor.module';
import { Module } from '@nestjs/common';
import { GetOrderOnDataBaseUseCase } from './use-case/get-order-on-database.use-case';
import { UpdatedOrderStatusUseCase } from './use-case/update-order-status.use-case';
import { RetryScrapImageProductUseCase } from './use-case/retry-create-image-product.use-case';
import { UpdateImageProductUseCase } from './use-case/update-image-product.use-case';
import { DeleteProductsUseCase } from './use-case/delete-products.use-case';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    IntegrationModule,
    WordpressModule,
    VetorModule,
  ],
  providers: [
    CreateProductWithImagesOnWoocommerce,
    RetryScrapImageProductUseCase,
    CreateProductOnWoocommerce,
    UpdateAllProductsFromVetor,
    UpdateImageProductUseCase,
    UpdatedOrderStatusUseCase,
    GetOrderOnDataBaseUseCase,
    DeleteProductsUseCase,
    CreateCategoryUseCase,
    UpdateProductUseCase,
    CreateOrderUseCase,
    WoocommerceService,
    ScrapImagesUseCase,
    GetProductUseCase,
    ProductService,
    OrderService,
  ],
  controllers: [WoocommerceController],
  exports: [],
})
export class WoocommerceModule {}
