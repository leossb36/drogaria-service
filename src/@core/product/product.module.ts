import { CreateCategoryUseCase } from './use-case/create-category.use-case';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { WordpressModule } from '@core/wordpress/wordpress.module';
import { Module } from '@nestjs/common';
import { GetOrderOnDataBaseUseCase } from '../order/use-case/get-order-on-database.use-case';
import { UpdateImageProductUseCase } from './use-case/update-image-product.use-case';
import { OrderModule } from '@core/order/order.module';
import { ProductSchedule } from '@core/schedule/product.schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { Product } from '@core/order/dto/get-product.dto';
import { ProductSchema } from '@core/infra/db/schema/product.schema';
import { PutProductUseCase } from './use-case/put-product.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { StreamModule } from '@core/stream/stream.module';
import { ProductService } from './product.service';
import { ProductAdapter } from './product.adapter';
import { PutSkuUseCase } from './use-case/put-sku.use-case';
import { ProductController } from './product.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    IntegrationModule,
    WordpressModule,
    OrderModule,
    StreamModule,
  ],
  providers: [
    ProductService,
    ProductAdapter,
    PutSkuUseCase,
    ProductRepository,
    PutProductUseCase,
    UpdateImageProductUseCase,
    GetOrderOnDataBaseUseCase,
    CreateCategoryUseCase,
    ScrapImagesUseCase,
    ProductSchedule,
  ],
  controllers: [ProductController],
  exports: [
    ProductRepository,
    PutProductUseCase,
    UpdateImageProductUseCase,
    GetOrderOnDataBaseUseCase,
    CreateCategoryUseCase,
    ScrapImagesUseCase,
    ProductSchedule,
  ],
})
export class ProductModule {}
