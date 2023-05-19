import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import { getProductWooCommerceModelView } from '../mv/get-product-woo.mv';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(): Promise<getProductWooCommerceModelView[]> {
    const products = await this.integration.productById('11041');

    if (!products.data) {
      throw new BadRequestException('Cannot list products!');
    }

    return products.data;
  }
}
