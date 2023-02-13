import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(dto: unknown): Promise<unknown> {
    const product = await this.integration.createProduct(dto);

    if (!product) {
      throw new BadRequestException('Cannot create product!');
    }

    return product;
  }
}
