import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';

@Injectable()
export class ScrapImagesUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(streamProducts: any[], retry: number): Promise<any> {
    try {
      const images = await Promise.all(
        streamProducts.map((product) => {
          const query =
            product.attributes[0].options[0] !== null
              ? product.attributes[0].options[0].toString()
              : product.description;
          return this.searchEngine.getImageUrl(query, retry);
        }),
      );
      const products = [];

      streamProducts.forEach((product, index) => {
        products.push({
          ...product,
          images: [{ src: images[index] }],
        });
      });

      const chunks = ChunckData(products);

      for (const chunk of chunks) {
        await this.productRepository.updateProductBatch(chunk);
      }
      return products;
    } catch (error) {
      return null;
    }
  }
}
