import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Woocommerce')
@Controller('woocommerce')
export class WoocommerceController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
  ) {}

  @Post('/product')
  async createProduct(): Promise<unknown> {
    return await this.createProductUseCase.execute();
  }

  @Get('/products')
  async listProducts() {
    return await this.getProductUseCase.execute();
  }

  @Post('/order')
  async createOrder(@Body() body: unknown): Promise<unknown> {
    return await this.createOrderUseCase.execute(body);
  }

  @Post('/category')
  async createCategory(): Promise<unknown> {
    return await this.createCategoryUseCase.execute();
  }
}
