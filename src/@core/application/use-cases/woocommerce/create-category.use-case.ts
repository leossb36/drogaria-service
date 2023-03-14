import { Product } from '@core/application/dto/product.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ChunckData, FetchVetorCategories } from '@core/utils/fetch-helper';
import * as messages from '@common/messages/response-messages.json';
import { Injectable } from '@nestjs/common';
import { createWooCategoryModelView } from '@core/application/mv/create-woo-category.mv';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly vetorIntegration: VetorIntegrationGateway,
    private readonly woocommerceIntegration: WoocommerceIntegration,
  ) {}

  async execute(): Promise<createWooCategoryModelView> {
    const products: Product[] = await FetchVetorCategories(
      this.vetorIntegration,
    );

    if (!products.length) {
      return {
        message: 'Cannot find products to create categories',
        categories: [],
      };
    }

    const categories = this.formatCategories(products);

    if (!categories.length) {
      return {
        message: 'Cannot find categories to create',
        categories: [],
      };
    }
    const chunks = ChunckData(categories);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.createCategories(chunk);
    }

    return {
      message: messages.woocommerce.category.create.success,
      categories: categories,
    };
  }

  private formatCategories(products: Product[]) {
    const result = Array.from(
      new Set(products.map((product) => product.nomeCategoria)),
    ).map((name) => {
      return {
        name,
      };
    });

    return result;
  }
}
