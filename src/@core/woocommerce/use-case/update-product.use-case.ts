import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ChunckData } from '@core/utils/fetch-helper';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(): Promise<any> {
    const productsByOrder = await this.orderRepository.findProductCompleted();
    if (!productsByOrder.length) {
      return {
        count: 0,
        message: 'Does not have product to update stock',
      };
    }
    const updateProductOnWoocommerceStock = [];

    for (const item of productsByOrder[0].items) {
      const { data } = await this.vetorIntegration.getProductInfo(
        '/produtos/consulta',
        {
          $filter: `cdFilial eq 1 and cdProduto eq ${item.vetorId}`,
        },
      );

      if (!data.length) {
        console.log('Cannot update product with id', item.vetorId);
        return;
      }

      const product = data[0];
      updateProductOnWoocommerceStock.push({
        id: item.woocommerceId,
        stock_quantity: product.qtdEstoque,
        categories: item.categories,
      });
    }

    const chunks = ChunckData(updateProductOnWoocommerceStock);
    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
    }
    await this.orderRepository.updateOrderStatus([productsByOrder[0]._id]);

    return {
      count: updateProductOnWoocommerceStock.length,
      message: messages.woocommerce.product.update.success,
    };
  }
}
