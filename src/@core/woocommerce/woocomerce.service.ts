import { headersTopicEnum } from '@core/application/dto/enum/headers-topic.enum';
import { webhookStatusEnum } from '@core/application/dto/enum/webhook-status.enum';
import { CreateOrderUseCase } from '@core/application/use-cases/vetor/create-order.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WoocommerceService {
  constructor(private readonly vetorCreateOrderUseCase: CreateOrderUseCase) {}

  async handlerWebhookExecution(webhook: any, headers: Headers): Promise<any> {
    if (
      headers['x-wc-webhook-topic'] === headersTopicEnum.UPDATED &&
      webhook.status === webhookStatusEnum.PROCESSING
    ) {
      return await this.vetorCreateOrderUseCase.execute(webhook);
    }
    // if (
    //   // need vetor status to update order
    // ) {
    //   return await this.vetorCreateOrderUseCase.execute(webhook);
    // }
    return;
  }
}
