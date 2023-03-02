import {
  GetProductVetorDto,
  getWebhookDto,
  GetOrderDto,
} from '@core/application/dto';
import { CreateOrderInformationModelView } from '@core/application/mv/create-order-information.mv';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vetor')
@Controller('vetor')
export class VetorIntegrationController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post('/order')
  async createOrder(
    @Body() body: getWebhookDto,
  ): Promise<CreateOrderInformationModelView> {
    return await this.createOrderUseCase.execute(body);
  }

  @Get('/order/status')
  async getOrderStatus(@Query() query: GetOrderDto) {
    return await this.getOrderUseCase.execute(query);
  }
}
