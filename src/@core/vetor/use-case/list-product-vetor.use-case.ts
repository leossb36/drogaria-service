import { BadRequestException, Injectable } from '@nestjs/common';
import { ReadStreamVetorUseCase } from './read-stream-vetor.use-case';
import { getProductWooCommerceModelView } from '@core/woocommerce/mv/get-product-woo.mv';

@Injectable()
export class ListProductVetorUseCase {
  constructor(
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
  ) {}

  async execute(): Promise<getProductWooCommerceModelView[]> {
    const products: getProductWooCommerceModelView[] =
      await this.readStreamVetorUseCase.readFromJson();

    if (!products.length) {
      throw new BadRequestException('Cannot find any product');
    }

    return products;
  }
}
