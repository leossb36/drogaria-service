import { OrderService } from '../services/orders.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class OrderSchedule {
  private readonly logger = new Logger(OrderSchedule.name)
  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async createOrder(): Promise<void> {
    try {
      this.logger.debug('Iniciando criacao de pedido na vetor')
      await this.orderService.createOrder()
      this.logger.debug('Finalizando criacao de pedido na vetor')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    }
  }
}
