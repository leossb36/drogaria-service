import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { ChunckData } from '@core/utils/fetch-helper';

@Injectable()
export class CreateProductOnWoocommerce {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any[]> {
    try {
      const skusWoocommerce =
        await this.woocommerceIntegration.getAllProductsSku();
      const productsOnDataBase =
        await this.productRepository.findProductsWithoutImageAndNotInWooCommerce(
          skusWoocommerce,
          100,
        );

      if (!productsOnDataBase.length) {
        return [];
      }

      const chunks = ChunckData(productsOnDataBase);

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
