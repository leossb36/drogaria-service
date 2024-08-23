import { CronLockService } from '@app/modules/shared/cron/lock.service'
import { OrderService } from '../services/orders.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class OrderSchedule {
  private readonly logger = new Logger(OrderSchedule.name)
  constructor(
    private readonly orderService: OrderService,
    private readonly cronLockService: CronLockService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async createOrder(): Promise<void> {
    if (!this.cronLockService.acquireLock(OrderSchedule.name)) {
      console.log(`Cron em execucao: ${OrderSchedule.name}`)
      return
    }
    try {
      this.logger.debug('Iniciando criacao de pedido na vetor')
      await this.orderService.createOrder()
      this.logger.debug('Finalizando criacao de pedido na vetor')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    } finally {
      this.cronLockService.releaseLock(OrderSchedule.name)
    }
  }
}
