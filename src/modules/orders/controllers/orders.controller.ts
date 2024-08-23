import { Body, Controller, InternalServerErrorException, Patch, Post } from '@nestjs/common'
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger'
import { GetOrderModelView } from '../model-views/get-order.mv'
import { createOrderResponse } from '../swagger/order.response'
import { OrderService } from '../services/orders.service'
import { GetWebhookDto } from '../dtos/webhook.dto'

@Controller(`orders`)
@ApiTags(`Order`)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ordem de pedido na vetor' })
  @ApiResponse(createOrderResponse.success)
  @ApiResponse(createOrderResponse.badRequest)
  @ApiResponse(createOrderResponse.internalServerError)
  async createOrder(): Promise<GetOrderModelView> {
    try {
      const response = await this.orderService.createOrder()
      return response
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Patch('/pedidos/notificar')
  @ApiOperation({ summary: 'Atualizar ordem de pedido por meio de webhook' })
  @ApiResponse(createOrderResponse.success)
  @ApiResponse(createOrderResponse.badRequest)
  @ApiResponse(createOrderResponse.internalServerError)
  async updateOrder(@Body() webhook: GetWebhookDto): Promise<number> {
    try {
      return await this.orderService.updateOrder(webhook)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
