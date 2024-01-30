import { Injectable } from '@nestjs/common';
import { GetProductVetorUseCase } from '@core/vetor/use-case/get-product-vetor.use-case';
import { CategoryEnum } from '@core/common/enum/category.enum';
import { delay } from '@core/utils/delay';

@Injectable()
export class DeleteProductsUseCase {
  constructor(
    private readonly getProductVetorUseCase: GetProductVetorUseCase,
  ) {}

  async execute(products: any[]): Promise<any[]> {
    const productsToDelete = [];
    for (const product of products) {
      await delay(1000);
      const productToDelete = await this.hasProductOnVetor(product);

      if (
        productToDelete &&
        !Object.values(CategoryEnum).includes(productToDelete.nomeLinha)
      ) {
        productsToDelete.push(product);
      } else {
        continue;
      }
    }
    if (!productsToDelete.length) {
      return [];
    }

    return productsToDelete;
  }

  private async hasProductOnVetor(product: any) {
    const hasProduct = await this.getProductVetorUseCase.execute(
      product.sku.split('-')[0],
    );

    if (hasProduct) return hasProduct;
    else return;
  }
}
