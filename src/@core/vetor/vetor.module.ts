import { VetorIntegrationController } from './vetor.controller';
import { SaveProductStreamUseCase } from './use-case/save-product-vetor-stream.use-case';
import { ListProductVetorUseCase } from './use-case/list-product-vetor.use-case';
import { Product, ProductSchema } from '@core/infra/db/schema/product.schema';
import { ReadStreamVetorUseCase } from './use-case/read-stream-vetor.use-case';
import { GetProductVetorUseCase } from './use-case/get-product-vetor.use-case';
import { SaveOrderVetorUseCase } from './use-case/save-order-vetor.use-case';
import { GetOrderVetorUseCase } from './use-case/get-order-vetor.use-case';
import { Order, OrderSchema } from '@core/infra/db/schema/order.schema';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { CloudinaryModule } from '@core/cloudinary/cloudinary.module';
import { WordpressModule } from '@core/wordpress/wordpress.module';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { VetorService } from './vetor.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    IntegrationModule,
    CloudinaryModule,
    WordpressModule,
  ],
  providers: [
    SaveProductStreamUseCase,
    ListProductVetorUseCase,
    ReadStreamVetorUseCase,
    GetProductVetorUseCase,
    SaveOrderVetorUseCase,
    GetOrderVetorUseCase,
    ScrapImagesUseCase,
    ProductRepository,
    OrderRepository,
    VetorService,
  ],
  controllers: [VetorIntegrationController],
  exports: [
    SaveProductStreamUseCase,
    ReadStreamVetorUseCase,
    SaveOrderVetorUseCase,
    ScrapImagesUseCase,
    ProductRepository,
    OrderRepository,
  ],
})
export class VetorModule {}
