import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SaveProductStreamUseCase } from './use-case/save-product-vetor-stream.use-case';
import { GetProductVetorUseCase } from './use-case/get-product-vetor.use-case';
import { GetOrderVetorUseCase } from './use-case/get-order-vetor.use-case';
import { GetOrderDto } from './dto/get-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { VetorService } from './vetor.service';

@ApiTags('Vetor')
@Controller('vetor')
export class VetorIntegrationController {
  constructor(
    private readonly saveProductStreamUseCase: SaveProductStreamUseCase,
    private readonly getProductVetorUseCase: GetProductVetorUseCase,
    private readonly getOrderVetorUseCase: GetOrderVetorUseCase,
    private readonly vetorService: VetorService,
  ) {}

  @Get('/products')
  async getProducts(@Param('code') code: number): Promise<any> {
    return await this.getProductVetorUseCase.execute(code);
  }

  @Post('/product/save/stream')
  async fetchAllProducts(): Promise<any> {
    return await this.saveProductStreamUseCase.execute();
  }

  @Get('/order/status')
  async getOrderStatus(@Query() query: GetOrderDto) {
    return await this.getOrderVetorUseCase.execute(query);
  }

  @Post('/product/save/cloudinary')
  async getProductsCodeBar() {
    return await this.vetorService.saveProductInfo();
  }
}
