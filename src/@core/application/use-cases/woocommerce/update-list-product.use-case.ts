import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import FromTo from '@core/utils/mapper-helper';

@Injectable()
export class UpdateProductListUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
  ) {}

  async execute(): Promise<unknown> {
    const params = {
      $filter: `cdFilial eq 1`,
    };

    const productFromVetor = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      params,
    );

    for (const product of productFromVetor.data) {
      const bodyFromVetor = FromTo(product);
      const wooProduct = await this.woocommerceIntegration.getProductBySku(
        bodyFromVetor.sku,
      );

      if (wooProduct.length) {
        await this.woocommerceIntegration.updateProductStock(
          wooProduct[0].id,
          bodyFromVetor,
        );
      } else {
        continue;
      }
    }

    return {
      message: messages.woocommerce.product.update.success,
    };
  }
}
