import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { createWooProductModelView } from '@core/application/mv/create-woo-product.mv';
import { ReadStreamService } from '@core/utils/read-stream';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly searchEngine: SerpApiIntegration,
    private readonly readStreamService: ReadStreamService,
  ) {}

  async execute(): Promise<createWooProductModelView> {
    try {
      const wooproducts = (
        await this.readStreamService.filterProductsVetor()
      ).slice(1, 2);

      // const images = await Promise.all(
      //   wooproducts.map((product) =>
      //     this.searchEngine.getImageUrl(product.description),
      //   ),
      // );
      const products = [];

      wooproducts.forEach(async (product, index) => {
        products.push({
          ...product,
          // images: [{ src: images[index] }],
        });
      });

      const chunks = ChunckData(products);

      for (const chunk of chunks) {
        await this.woocommerceIntegration.createProduct(chunk);
      }
      return {
        total: products.length,
        message: messages.woocommerce.product.create.success,
      };
    } catch (error) {
      return null;
    }
  }
}
