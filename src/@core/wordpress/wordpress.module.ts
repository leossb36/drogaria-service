import { GetProductsFromWoocommerceUseCase } from './use-case/get-products-from-woocommerce.use-case';
import { CreateImageOnWordpressUseCase } from './use-case/create-image-on-wordpress.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [CreateImageOnWordpressUseCase, GetProductsFromWoocommerceUseCase],
  exports: [GetProductsFromWoocommerceUseCase],
})
export class WordpressModule {}
