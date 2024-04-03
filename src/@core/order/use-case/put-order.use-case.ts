import { ValidationHelper } from '@core/utils/validation-helper';
import { Injectable } from '@nestjs/common';
import { GetOrderVetorUseCase } from './get-order.use-case';
import { delay } from '@core/utils/delay';
import { GetOrderOnDataBaseUseCase } from './get-order-on-database.use-case';
import { UpdatedOrderStatusUseCase } from './update-order-status.use-case';

@Injectable()
export class PutOrderUseCase {
  constructor(
    private readonly getOrderOnDataBaseUseCase: GetOrderOnDataBaseUseCase,
    private readonly updateOrderStatusUseCase: UpdatedOrderStatusUseCase,
    private readonly getOrderOnVetorUseCase: GetOrderVetorUseCase,
  ) {}

  async execute(): Promise<number> {
    const ordersOnDataBase = await this.getOrderOnDataBaseUseCase.execute();

    if (!ordersOnDataBase.length) {
      return 0;
    }

    const ordersToUpdate = [];
    for (const order of ordersOnDataBase) {
      await delay(1000);
      try {
        const orderFromVetor = await this.getOrderOnVetorUseCase.execute({
          numeroPedido: order.numeroPedido,
          cdOrcamento: order.cdOrcamento,
        });

        if (orderFromVetor && orderFromVetor.situacao !== order.situacao) {
          ordersToUpdate.push(
            ValidationHelper.setStatus(orderFromVetor, order.numeroPedido),
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (!ordersToUpdate.length) {
      return 0;
    }

    return await this.updateOrderStatusUseCase.execute(ordersToUpdate);
  }
}
