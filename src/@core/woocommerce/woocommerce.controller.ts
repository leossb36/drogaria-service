import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { createWooOrderDto } from '@core/application/dto';
import { createWooCategoryModelView } from '@core/application/mv/create-woo-category.mv';
import { createWooOrderModelView } from '@core/application/mv/create-woo-order.mv';
import { CreateCategoryUseCase } from '@core/application/use-cases/woocommerce/create-category.use-case';
import { CreateOrderUseCase } from '@core/application/use-cases/woocommerce/create-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/woocommerce/get-product.use-case';
import { UpdateProductBatchUseCase } from '@core/application/use-cases/woocommerce/update-batch-product.use-case';
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
    private readonly updateProductBatchUseCase: UpdateProductBatchUseCase,
    private readonly woocommerceService: WoocommerceService,
    private readonly updatedOrderStatus: UpdatedOrderStatus,
  ) {}

  @Put('/product/update')
  async createProduct(): Promise<unknown> {
    return await this.woocommerceService.updateProductRoutine();
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

  @Put('/products')
  async updateProductsBatch(): Promise<unknown> {
    return await this.updateProductBatchUseCase.execute();
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

  @Put('/order/update')
  async updateOrderBatch(): Promise<unknown> {
    return await this.updatedOrderStatus.execute();
  }
  @Post('category')
  async createCategory(): Promise<createWooCategoryModelView> {
    return await this.createCategoryUseCase.execute();
  }
}
