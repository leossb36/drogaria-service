import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PutSkuUseCase {
  constructor(
    private readonly woocommerceIntergration: WoocommerceIntegration,
  ) {}

  async execute() {
    const products = await this.woocommerceIntergration.getOldProducts();

    const updates = products.map((product) => ({
      ...product,
      sku: product.sku.split('-')[0],
    }));

    if (!updates.length) {
      return 0;
    }

    const chunks = ChunckData(updates);
    const responseArray = [];

    for (const chunk of chunks) {
      const response = await this.woocommerceIntergration.updateProductBatch(
        chunk,
      );

      responseArray.push(response);
    }

    if (!responseArray.length) {
      return 0;
    }

    return responseArray.length;
  }
}
