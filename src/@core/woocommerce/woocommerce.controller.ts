import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { createWooOrderDto } from '@core/application/dto';
import { createWooCategoryModelView } from '@core/application/mv/create-woo-category.mv';
import { createWooOrderModelView } from '@core/application/mv/create-woo-order.mv';
import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdatedOrderStatus } from '@core/application/use-cases/woocommerce/update-order-status.use-case';
import { UpdateProductUseCase } from '@core/application/use-cases/woocommerce/update-product.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WoocommerceService } from './woocomerce.service';
import { OrderService } from '@core/schedule/order.service';
import { UpdateAllProductsFromVetor } from '@core/application/use-cases/woocommerce/update-all-products.use-case';

@ApiTags('Woocommerce')
@Controller('woocommerce')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class WoocommerceController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly woocommerceService: WoocommerceService,
    private readonly updatedOrderStatus: UpdatedOrderStatus,
    private readonly updateAllProductsFromVetor: UpdateAllProductsFromVetor,
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
