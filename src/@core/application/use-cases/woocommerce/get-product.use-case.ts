import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(): Promise<getProductWooCommerce[]> {
    const products = await this.integration.getAllProducts();

    if (!products.length) {
      throw new BadRequestException('Cannot list products!');
    }

    return products;
  }
}
