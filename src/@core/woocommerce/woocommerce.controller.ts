import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { createWooCategoryModelView } from './mv/create-woo-category.mv';
import { UpdateAllProductsFromVetor } from './use-case/update-all-products.use-case';
import { createWooOrderModelView } from './mv/create-woo-order.mv';
import { CreateCategoryUseCase } from './use-case/create-category.use-case';
import { UpdateProductUseCase } from './use-case/update-product.use-case';
import { WoocommerceService } from './woocomerce.service';
import { CreateOrderUseCase } from './use-case/create-order.use-case';
import { UpdatedOrderStatus } from './use-case/update-order-status.use-case';
import { GetProductUseCase } from './use-case/get-product.use-case';
import { createWooOrderDto } from './dto/create-woo-order.dto';
import { OrderService } from '@core/schedule/order.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Woocommerce')
@Controller('woocommerce')
export class WoocommerceController {
  constructor(
    private readonly updateAllProductsFromVetor: UpdateAllProductsFromVetor,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly woocommerceService: WoocommerceService,
    private readonly updatedOrderStatus: UpdatedOrderStatus,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly orderService: OrderService,
  ) {}

  @Put('/product/update')
  async updateProductRoutine(): Promise<unknown> {
    return await this.woocommerceService.updateProductRoutine();
  }

  @Put('/product/update/all')
  async UpdateAllProductsFromVetor(): Promise<unknown> {
    return await this.updateAllProductsFromVetor.execute();
  }

  @Put('/product/retry')
  async retryScrapNewImage(): Promise<unknown> {
    return await this.woocommerceService.retryScrapNewImage();
  }

  @Post('/product/create/woo')
  async createProductRoutineOnWoocommerce(): Promise<unknown> {
    return await this.woocommerceService.createProductRoutineOnWoocommerce();
  }

  @Post('/product/create/mongo')
  async createProductRoutineOnMongo(): Promise<unknown> {
    return await this.woocommerceService.createProductRoutineOnMongo();
  }

  @Put('/products/fetch')
  async updateProductFetch(): Promise<unknown> {
    return await this.updateProductUseCase.execute();
  }

  @Get('/products')
  async listProducts(): Promise<any[]> {
    return await this.getProductUseCase.execute();
  }

  @Post('/order')
  async createOrder(
    @Body() body: createWooOrderDto,
  ): Promise<createWooOrderModelView> {
    return await this.createOrderUseCase.execute(body);
  }

  @Post('/order/send/vetor')
  async sendOrderToVetor(): Promise<any> {
    return await this.orderService.sendOrderToVetor();
  }

  @Put('/order/update')
  async updateOrderBatch(): Promise<unknown> {
    return await this.updatedOrderStatus.execute();
  }
  @Post('category')
  async createCategory(): Promise<createWooCategoryModelView> {
    return await this.createCategoryUseCase.execute();
  }
}
