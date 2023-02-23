import { createWooOrderDto } from '@core/application/dto/createWooOrder.dto';
import { createWooOrderModelView } from '@core/application/mv/createWooOrder.mv';
import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { CreateProductUseCase } from '@core/application/use-cases/woocommerce/create-product.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdateProductListUseCase } from '@core/application/use-cases/woocommerce/update-list-product.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WoocommerceService } from './woocomerce.service';

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
    private readonly woocommerceService: WoocommerceService,
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
  async createOrder(
    @Body() body: createWooOrderDto,
  ): Promise<createWooOrderModelView> {
    return await this.createOrderUseCase.execute(body);
  }

  @Post('/order/webhook')
  async handlerWebhookExecution(
    @Body() webhook: any,
    @Headers() headers,
  ): Promise<any> {
    return await this.woocommerceService.handlerWebhookExecution(
      webhook,
      headers,
    );
  }
  /**
   * QUESTION: How are vetor changes the status order?
   * QUESTION: Is possible force some status on vetor to update the product data?
   * TODO: send request to vetor then
   * when the order is FATURED? or ON_SEPARETE (in vetor)
   * send a webhook that update product stock in woocommerce stock as like vetor stock
   */

  @Post('/category')
  async createCategory(): Promise<unknown> {
    return await this.createCategoryUseCase.execute();
  }
}
