import { Injectable } from '@nestjs/common';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class CreateProductUseCaseOnMongo {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(products: any[]): Promise<any> {
    try {
      const affected = await this.productRepository.createProductBatch(
        products,
      );

      return affected;
    } catch (error) {
      return null;
    }
  }
}
