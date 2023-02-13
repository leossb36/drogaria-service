import { CreateOrderDto } from '@core/application/dto/createOrder.dto';
import { GetOrderDto } from '@core/application/dto/getOrder.dto';
import { GetProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { CreateOrderInformationModelView } from '@core/application/mv/createOrderInformation.mv';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/get-product.use-case';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vetor')
@Controller('vetor')
export class VetorIntegrationController {
  constructor(
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Get('/products')
  async getProduct(
    @Query() query: GetProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    return await this.getProductUseCase.execute(query);
  }

  @Post('/order')
  async createOrder(
    @Body() body: CreateOrderDto,
  ): Promise<CreateOrderInformationModelView> {
    return await this.createOrderUseCase.execute(body);
  }

  @Get('/order/status')
  async getOrderStatus(@Query() query: GetOrderDto) {
    return await this.getOrderUseCase.execute(query);
  }
}
