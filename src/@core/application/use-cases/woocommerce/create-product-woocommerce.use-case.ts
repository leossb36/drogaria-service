import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';

@Injectable()
export class CreateProductOnWoocommerce {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
  ) {}

  async execute(products: any[]): Promise<any[]> {
    try {
      if (!products.length) {
        return [];
      }

      const chunks = ChunckData(products);

      const result = [];
      for (const chunk of chunks) {
        const products = await this.woocommerceIntegration.createProductBatch(
          chunk,
        );
        result.push(...products.data?.create);
      }
      return result;
    } catch (error) {
      return null;
    }
  }
}
