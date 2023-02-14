import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { Product } from '@core/infra/integration/model/product.model';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
  ) {}

  async execute(): Promise<unknown> {
    const categoryFromVetor = await this.vetorIntegration.getCategories(
      '/produtos/consulta',
    );

    if (!categoryFromVetor) {
      throw new BadRequestException('Cannot Create Categories from Vetor');
    }

    const wooCategories = await this.woocommerceIntegration.createCategories({
      ...categoryFromVetor,
      image: undefined,
    });

    if (!wooCategories) {
      throw new BadRequestException('Cannot Create Categories on woocommerce');
    }

    return wooCategories;
  }
}
