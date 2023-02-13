import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(): Promise<getProductWooCommerce[]> {
    const { data, status } = await this.integration.getAllProducts();

    if (!data.length || !ValidationHelper.isOk(status)) {
      throw new BadRequestException('Cannot list products!');
    }

    return data;
  }
}
