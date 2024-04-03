import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { GetProductWoocommerceModelView } from '../mv/get-product-woo.mv';

@Injectable()
export class PutProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(products: GetProductWoocommerceModelView[]): Promise<number> {
    const chunks = ChunckData(products);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
      await this.productRepository.updateProductBatch(chunk);
    }

    return products.length;
  }
}
