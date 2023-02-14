import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(dto: unknown): Promise<unknown> {
    const product = await this.integration.createOrder(dto);

    if (!product || !ValidationHelper.isCreated(product.status)) {
      throw new BadRequestException('Cannot create product!');
    }

    return product;
  }
}
