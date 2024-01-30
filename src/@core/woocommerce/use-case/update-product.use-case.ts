import { Injectable } from '@nestjs/common';
import { GetProductVetorUseCase } from '@core/vetor/use-case/get-product-vetor.use-case';
import { CategoryEnum } from '@core/common/enum/category.enum';
import { AdapterHelper } from '@core/utils/adapter-helper';
import { delay } from '@core/utils/delay';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly getProductVetorUseCase: GetProductVetorUseCase,
  ) {}

  async execute(products: any[]): Promise<any[]> {
    const productsToUpdate = [];
    for (const product of products) {
      await delay(1000);
      const productToUpdate = await this.hasProductOnVetor(product);

      if (
        productToUpdate &&
        Object.values(CategoryEnum).includes(productToUpdate.nomeLinha)
      ) {
        productsToUpdate.push({
          id: product.id,
          ...AdapterHelper.buildProduct(productToUpdate),
        });
      } else {
        continue;
      }
    }
    if (!productsToUpdate.length) {
      return [];
    }

    return productsToUpdate;
  }

  private async hasProductOnVetor(product: any) {
    const hasProduct = await this.getProductVetorUseCase.execute(
      product.sku.split('-')[0],
    );

    return hasProduct ? hasProduct : undefined;
  }
}
