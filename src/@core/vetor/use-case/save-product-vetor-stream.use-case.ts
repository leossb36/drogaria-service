import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { FetchVetorProducts } from '@core/utils/fetch-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import { Product } from '../dto/get-product.dto';

@Injectable()
export class SaveProductStreamUseCase {
  constructor(private readonly vetorIntegration: VetorIntegrationGateway) {}

  async execute(): Promise<any> {
    const products: Product[] = await FetchVetorProducts(this.vetorIntegration);

    if (!products.length) {
      throw new BadRequestException('Cannot find any product');
    }

    const folder = path.join(__dirname, 'infra', 'seed');

    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    const fullFilePath = path.join(folder, 'data.json');

    const jsonData = JSON.stringify(products, null, 2);

    writeFileSync(fullFilePath, jsonData);

    return { success: true };
  }
}
