import { ProductService } from '../services/products.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ProductSchedule {
  private readonly logger = new Logger(ProductSchedule.name)

  constructor(private readonly productService: ProductService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createProducts(): Promise<void> {
    try {
      this.logger.debug('Iniciando servico de criacao de produto em stream')
      await this.productService.saveOnStream()
      await this.productService.createProducts()
      this.logger.debug('Finalizando servico de criacao produto em stream')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    }
  }

  @Cron('0 */17 * * * *')
  async updateProducts(): Promise<void> {
    try {
      this.logger.debug('Iniciando Rotina de atualizacao de produtos na plataforma')
      await this.productService.saveOnStream()
      await this.productService.updateProducts()
      this.logger.debug('Finalizando Rotina de atualizacao de produtos na plataforma')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateImageProduct(): Promise<void> {
    try {
      this.logger.debug('Iniciando Rotina de atualizacao imagens dos produtos na plataforma')
      await this.productService.saveOnStream()
      await this.productService.updateImageProduct()
      this.logger.debug('Finalizando Rotina de atualizacao imagens dos produtos na plataforma')
    } catch (error) {
      this.logger.error('Erro ao processar os dados para a vetor:', error.message)
    }
  }
}
