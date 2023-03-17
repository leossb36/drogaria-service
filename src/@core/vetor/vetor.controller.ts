import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { getWebhookDto, GetOrderDto } from '@core/application/dto';
import { CreateOrderInformationModelView } from '@core/application/mv/create-order-information.mv';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { GetOrderUseCase } from '@core/application/use-cases/vetor/get-order.use-case';
import { GetProductUseCase } from '@core/application/use-cases/vetor/get-product.use-case';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Vetor')
@Controller('vetor')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class VetorIntegrationController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getProductUseCase: GetProductUseCase,
  ) {}

  @Get('/products')
  async getProducts(): Promise<any> {
    return await this.getProductUseCase.execute();
  }

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
