import { Injectable } from '@nestjs/common';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { ProductRepository } from '@core/infra/db/repositories/mongo/product.repository';

@Injectable()
export class ScrapImagesUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(productOnWoocommerce: any[], retry: number): Promise<any> {
    try {
      const images = await Promise.all(
        productOnWoocommerce.map((product) =>
          this.searchEngine.getImageUrl(product.description, retry),
        ),
      );
      const products = [];

      productOnWoocommerce.forEach((product, index) => {
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
