import { Injectable } from '@nestjs/common';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { ChunckData } from '@core/utils/fetch-helper';
import { ProductRepository } from '@core/infra/db/repositories/mongo/product.repository';
import CustomLogger from '@common/logger/logger';

@Injectable()
export class ScrapImagesUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly searchEngine: SerpApiIntegration,
  ) {}

  async execute(productOnWoocommerce: any[], retry: number): Promise<any> {
    CustomLogger.info(`[WoocommerceService - ScrapImagesUseCase]  Start job`);
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
      CustomLogger.info(`[WoocommerceService - ScrapImagesUseCase]  End job`);
      return products;
    } catch (error) {
      CustomLogger.info(
        `[WoocommerceService - ScrapImagesUseCase]  End job with error: ${error}`,
      );
      return null;
    }
  }
}
