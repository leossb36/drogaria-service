import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createWooOrderDto } from '../dto/create-woo-order.dto';
import { createWooOrderModelView } from '../mv/create-woo-order.mv';

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
