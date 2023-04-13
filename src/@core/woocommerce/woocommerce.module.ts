import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
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
import { OrderService } from '@core/schedule/order.service';
import { ProductService } from '@core/schedule/product.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapImagesUseCase } from '@core/application/use-cases/woocommerce/scrap-image-to-product.use-case';
import { CreateProductOnWoocommerce } from '@core/application/use-cases/woocommerce/create-product-woocommerce.use-case';
import { CreateProductUseCaseOnMongo } from '@core/application/use-cases/woocommerce/create-product-mongo.use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '@core/infra/db/schema/product.schema';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    VetorModule,
    IntegrationModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [
    CreateCategoryUseCase,
    GetProductUseCase,
    CreateOrderUseCase,
    UpdateProductUseCase,
    UpdateProductBatchUseCase,
    WoocommerceService,
    ReadStreamService,
    UpdatedOrderStatus,
    OrderService,
    ProductService,
    ScrapImagesUseCase,
    CreateProductOnWoocommerce,
    CreateProductUseCaseOnMongo,
    ProductRepository,
  ],
  controllers: [WoocommerceController],
})
export class WoocommerceModule {}
