import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import FromTo from '@core/utils/mapper-helper';
import { ChunckData } from '@core/utils/fetch-helper';

@Injectable()
export class UpdateProductBatchUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
  ) {}

  async execute(): Promise<unknown> {
    const products = [];
    const productsFromWoocommerce =
      await this.woocommerceIntegration.getAllProducts();

    for (const product of productsFromWoocommerce) {
      const productSku = product.sku.split('-');
      const productId = productSku[0];
      const requestFromVector = await this.vetorIntegration.getProductInfo(
        '/produtos/consulta',
        {
          $filter: `cdProduto eq ${productId} and cdFilial eq 1`,
        },
      );

      const { data } = requestFromVector;
      const bodyFromVetor = FromTo(data[0]);
      products.push({ id: product.id, ...bodyFromVetor });
    }

    const chunks = ChunckData(products);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
    }

    return {
      message: messages.woocommerce.product.update.success,
    };
  }
}
