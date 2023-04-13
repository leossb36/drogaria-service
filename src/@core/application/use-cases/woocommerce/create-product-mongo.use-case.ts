import { Injectable } from '@nestjs/common';
import { ReadStreamService } from '@core/utils/read-stream';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class CreateProductUseCaseOnMongo {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly readStreamService: ReadStreamService,
  ) {}

  async execute(): Promise<any> {
    try {
      const products = await this.readStreamService.filterProductsVetor();

      const affected = await this.productRepository.createProductBatch(
        products,
      );

      return affected;
    } catch (error) {
      return null;
    }
  }
}
