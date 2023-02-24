import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { Product } from '@core/infra/integration/model/product.model';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import FromTo from '@core/utils/mapper-helper';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(): Promise<unknown> {
    let total = 0;

    const query = {
      $filter: 'cdFilial eq 1',
    };

    const productsFromVetor = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
      query,
    );

    for (const product of productsFromVetor?.data) {
      const image = await this.searchEngine.getImageUrl(product.descricao);

      const formatedProduct = FromTo({ ...product, imageUrl: image });
      const hasProductOnWoocommerce = await this.validateProduct(
        formatedProduct,
      );
      if (!hasProductOnWoocommerce) {
        await this.woocommerceIntegration.createProduct(formatedProduct);
        total += 1;
      } else {
        continue;
      }
    }
    return {
      total: total,
      message: messages.woocommerce.product.create.success,
    };
  }
  private async validateProduct(
    newProduct: getProductWooCommerce,
  ): Promise<boolean> {
    const productsSkus = await this.woocommerceIntegration.getAllProductsSku();

    const hasProduct = productsSkus.filter((sku) => sku === newProduct.sku);

    return hasProduct.length > 0;
  }
}
