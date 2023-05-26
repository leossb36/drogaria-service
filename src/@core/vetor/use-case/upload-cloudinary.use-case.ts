import { Injectable } from '@nestjs/common';
import { ChunckData } from '@core/utils/fetch-helper';
import { CloudinaryService } from '@core/cloudinary/cloudinary.service';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class UploadCloudinaryUseCase {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(products: any[]): Promise<any> {
    try {
      const promises = products.map(async (product) => {
        const query =
          product.attributes[0].options[0] !== null
            ? product.attributes[0].options[0].toString()
            : product.description;
        return await this.cloudinaryService.create(product, query);
      });
      const result = await Promise.all(promises);

      const chunks = ChunckData(result);

      for (const chunk of chunks) {
        await this.productRepository.updateProductBatch(chunk);
      }
      return result;
    } catch (error) {
      return null;
    }
  }
}
