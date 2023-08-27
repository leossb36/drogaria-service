import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { createWooCategoryModelView } from './mv/create-woo-category.mv';
import { UpdateAllProductsFromVetor } from './use-case/update-all-products.use-case';
import { createWooOrderModelView } from './mv/create-woo-order.mv';
import { CreateCategoryUseCase } from './use-case/create-category.use-case';
import { WoocommerceService } from './woocomerce.service';
import { CreateOrderUseCase } from './use-case/create-order.use-case';
import { GetProductUseCase } from './use-case/get-product.use-case';
import { createWooOrderDto } from './dto/create-woo-order.dto';
import { OrderService } from '@core/schedule/order.service';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '@core/schedule/product.service';

@ApiTags('Woocommerce')
@Controller('woocommerce')
export class WoocommerceController {
  constructor(
    private readonly updateAllProductsFromVetor: UpdateAllProductsFromVetor,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly woocommerceService: WoocommerceService,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  @Put('/product/image/update')
  async updateProductRoutine(): Promise<unknown> {
    return await this.woocommerceService.updateImageProduct();
  }

  @Post('/product/image')
  async scrapImages(): Promise<unknown> {
    return await this.woocommerceService.scrapImages();
  }

  @Put('/product/full/update')
  async productRoutine(): Promise<unknown> {
    return await this.productService.productRoutine();
  }

  @Put('/product/update/all')
  async UpdateAllProductsFromVetor(): Promise<unknown> {
    return await this.updateAllProductsFromVetor.execute();
  }

  @Put('/product/retry')
  async retryScrapNewImage(): Promise<unknown> {
    return await this.woocommerceService.retryCreateImage();
  }

  @Post('/product/create')
  async createProductRoutineOnWoocommerce(): Promise<unknown> {
    return await this.woocommerceService.createProductRoutineOnWoocommerce();
  }

  @Post('/product/create/mongo')
  async createProductsOnDb(): Promise<unknown> {
    return await this.woocommerceService.createProductsOnDb();
  }

  @Delete('/product/delete')
  async deleteProducts(): Promise<unknown> {
    return await this.woocommerceService.deleteProducts();
  }

  @Delete('/product/mongo/delete')
  async deleteAll(): Promise<unknown> {
    return await this.woocommerceService.removeAllWithoutImage();
  }

  @Delete('/product/mongo/delete/all')
  async deleteAllWithoutImage(): Promise<unknown> {
    return await this.woocommerceService.deleteAllWithoutImage();
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
  async updateOrderBatch(): Promise<any> {
    return await this.woocommerceService.updateOrders();
  }
  @Post('category')
  async createCategory(): Promise<createWooCategoryModelView> {
    return await this.createCategoryUseCase.execute();
  }
}
