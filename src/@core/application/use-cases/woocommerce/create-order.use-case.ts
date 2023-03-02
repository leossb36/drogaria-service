import { createWooOrderDto } from '@core/application/dto';
import { createWooOrderModelView } from '@core/application/mv/create-woo-order.mv';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: WoocommerceIntegration) {}

  async execute(dto: createWooOrderDto): Promise<createWooOrderModelView> {
    const order = await this.integration.createOrder(dto);

    const { status, data } = order;

    if (!data || !ValidationHelper.isCreated(status)) {
      throw new BadRequestException('Cannot create order!');
    }

    return data;
  }
}
