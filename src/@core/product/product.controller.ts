import { Controller, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';

@Controller('products')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Put()
  async putSkuProduct(): Promise<number> {
    return await this.productService.putSkuProducts();
  }
}
