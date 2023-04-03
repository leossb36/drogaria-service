import { Product } from '@core/application/dto/product.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { FetchVetorProducts } from '@core/utils/fetch-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { writeFileSync } from 'fs';

@Injectable()
export class CreateProductsJsonUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(): Promise<any> {
    const products: Product[] = await FetchVetorProducts(this.vetorIntegration);

    if (!products.length) {
      throw new BadRequestException('Cannot find any product');
    }

    const fileName = './src/@core/infra/db/vetor-data.json';

    const jsonData = JSON.stringify(products, null, 2);

    writeFileSync(fileName, jsonData);

    return { success: true, count: products.length };
  }
}
