import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProductDataBaseUseCase {
  constructor(private readonly productsRepo: ProductRepository) {}

  async execute(skus: string[]): Promise<any[]> {
    const products = await this.productsRepo.getProductsSku(skus);

    if (!products.length) {
      return [];
    }

    return products;
  }
}
