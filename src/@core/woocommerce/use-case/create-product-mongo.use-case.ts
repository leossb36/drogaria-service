import { Injectable } from '@nestjs/common';
import { ReadStreamVetorUseCase } from '@core/vetor/use-case/read-stream-vetor.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class CreateProductUseCaseOnMongo {
  constructor(
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any> {
    try {
      const products = await this.readStreamVetorUseCase.readFromJson();

      const affected = await this.productRepository.createProductBatch(
        products,
      );

      return affected;
    } catch (error) {
      return null;
    }
  }
}
