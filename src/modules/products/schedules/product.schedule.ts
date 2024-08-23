import { CronLockService } from '@app/modules/shared/cron/lock.service'
import { ProductService } from '../services/products.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ProductSchedule {
  private readonly logger = new Logger(ProductSchedule.name)

  constructor(
    private readonly productService: ProductService,
    private readonly cronLockService: CronLockService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createProducts(): Promise<void> {
    try {
      if (!this.cronLockService.acquireLock(ProductSchedule.name)) {
        console.log(`Cron em execucao: ${ProductSchedule.name}`)
        return
      }
      this.logger.debug('Iniciando servico de criacao de produto em stream')
      await this.productService.saveOnStream()
      await this.productService.createProducts()
      this.logger.debug('Finalizando servico de criacao produto em stream')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    } finally {
      this.cronLockService.releaseLock(ProductSchedule.name)
    }
  }

  @Cron('0 */17 * * * *')
  async updateProducts(): Promise<void> {
    try {
      if (!this.cronLockService.acquireLock(ProductSchedule.name)) {
        console.log(`Cron em execucao: ${ProductSchedule.name}`)
        return
      }
      this.logger.debug('Iniciando Rotina de atualizacao de produtos na plataforma')
      await this.productService.saveOnStream()
      await this.productService.updateProducts()
      this.logger.debug('Finalizando Rotina de atualizacao de produtos na plataforma')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    } finally {
      this.cronLockService.releaseLock(ProductSchedule.name)
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateImageProduct(): Promise<void> {
    try {
      if (!this.cronLockService.acquireLock(ProductSchedule.name)) {
        console.log(`Cron em execucao: ${ProductSchedule.name}`)
        return
      }
      this.logger.debug('Iniciando Rotina de atualizacao imagens dos produtos na plataforma')
      await this.productService.saveOnStream()
      await this.productService.updateImageProduct()
      this.logger.debug('Finalizando Rotina de atualizacao imagens dos produtos na plataforma')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    } finally {
      this.cronLockService.releaseLock(ProductSchedule.name)
    }
  }
}
