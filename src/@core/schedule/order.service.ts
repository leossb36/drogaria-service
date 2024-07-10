import CustomLogger from '@common/logger/logger';
import { VetorService } from '@core/vetor/vetor.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(private readonly vetorService: VetorService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendOrderToVetor(): Promise<any> {
    CustomLogger.info(`[OrderService - sendOrderToVetor]  Start job`);
    await this.vetorService.saveOrderVetor();
    CustomLogger.info(`[OrderService - sendOrderToVetor]  End job`);
  }
}
