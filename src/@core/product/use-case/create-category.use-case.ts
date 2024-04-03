import { ChunckData } from '@core/utils/fetch-helper';
import * as messages from '@common/messages/response-messages.json';
import { Injectable } from '@nestjs/common';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { createWooCategoryModelView } from '../mv/create-woo-category.mv';
import { GetStreamUseCase } from '@core/stream/use-case/get-stream.use-case';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly getStreamUseCase: GetStreamUseCase,
  ) {}

  async execute(): Promise<createWooCategoryModelView> {
    const categories = await this.getStreamUseCase.readFromJson();

    if (!categories.length) {
      return {
        message: 'Cannot find products to create categories',
        categories: [],
      };
    }

    const woocategories = this.setCategories(categories);

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
}
