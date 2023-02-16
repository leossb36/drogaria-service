import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdateProductListUseCase } from '@core/application/use-cases/woocommerce/update-list-product.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Woocommerce')
@Controller('woocommerce')
export class WoocommerceController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateProductListUseCase: UpdateProductListUseCase,
  ) {}

  @Post('/product')
  async createProduct(): Promise<unknown> {
    return await this.createProductUseCase.execute();
  }

  @Put('/product/:id')
  async updateProductById(@Param('id') id: string): Promise<unknown> {
    return await this.updateProductUseCase.execute(id);
  }

  @Put('/products')
  async updateProductList(): Promise<unknown> {
    return await this.updateProductListUseCase.execute();
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
