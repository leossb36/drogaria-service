import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import FromTo from '@core/utils/mapper-helper';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { ChunckData, FetchVetorProducts } from '@core/utils/fetch-helper';
import { createWooProductModelView } from '@core/application/mv/create-woo-product.mv';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(): Promise<createWooProductModelView> {
    const products = [];
    const productsFromVetor = await FetchVetorProducts(this.vetorIntegration);

    for (const product of productsFromVetor) {
      const formatedProduct = FromTo(product);
      const hasProductOnWoocommerce = await this.validateProduct(
        formatedProduct,
      );
      if (hasProductOnWoocommerce) continue;

      const image = await this.searchEngine.getImageUrl(product.descricao);
      products.push({ ...formatedProduct, imageUrl: image });
    }

    const chunks = ChunckData(products);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.createProduct(chunk);
    }
    return {
      total: products.length,
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
