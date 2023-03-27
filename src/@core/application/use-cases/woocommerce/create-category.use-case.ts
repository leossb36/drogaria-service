import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import * as messages from '@common/messages/response-messages.json';
import { Injectable } from '@nestjs/common';
import { createWooCategoryModelView } from '@core/application/mv/create-woo-category.mv';
import { ReadStreamService } from '@core/utils/read-stream';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamService: ReadStreamService,
  ) {}

  async execute(): Promise<createWooCategoryModelView> {
    const categories = await this.readStreamService.filterCategoriesVetor();

    if (!categories.length) {
      return {
        message: 'Cannot find products to create categories',
        categories: [],
      };
    }

    const woocategories = this.setCategories(categories);

    // woocategories.map((category) => this.formatCategory(category));

    if (!woocategories.length) {
      return {
        message: 'Cannot find categories to create',
        categories: [],
      };
    }
    const chunks = ChunckData(woocategories);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.createCategories(chunk);
    }

    return {
      message: messages.woocommerce.category.create.success,
      categories: woocategories,
    };
  }

  private setCategories(categories: any[]) {
    const result = Array.from(
      new Set(categories.map((category) => category)),
    ).map((name) => {
      return name;
    });

    return result;
  }

  // private formatCategory(word: string): string {
  //   let result: string;
  //   const regex = new RegExp('&');

  //   if (regex.test(word)) {
  //     const compost = word.split('&');
  //     result =
  //       compost[0].charAt(0).toUpperCase() +
  //       result.slice(1) +
  //       ' & ' +
  //       compost[1].charAt(0).toUpperCase() +
  //       result.slice(1);
  //   }
  //   return `${result.charAt(0).toUpperCase()} ${result.slice(1)}`;
  // }
}
