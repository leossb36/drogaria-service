import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import FromTo from '@core/utils/mapper-helper';
import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
  ) {}

  async execute(id: string): Promise<unknown> {
    const params = {
      $filter: `cdProduto eq ${id} and cdFilial eq 1`,
    };

    const productFromVetor = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      params,
    );

    const bodyFromVetor = FromTo(productFromVetor.data[0]);
    const wooProduct: getProductWooCommerce =
      await this.woocommerceIntegration.getProductBySku(bodyFromVetor.sku);

    const product = await this.woocommerceIntegration.updateProductStock(
      wooProduct[0].id,
      bodyFromVetor,
    );

    if (!product.data) {
      throw new BadRequestException('Cannot update product!');
    }

    return {
      status: product.status,
      message: messages.woocommerce.product.update.success,
    };
  }
}
