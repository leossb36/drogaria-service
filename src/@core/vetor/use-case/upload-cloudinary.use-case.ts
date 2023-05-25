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
    const uploadedProducts = [];
    try {
      for (const product of products) {
        const query =
          product.attributes[0].options[0] !== null
            ? product.attributes[0].options[0].toString()
            : product.description;
        const upload = await this.cloudinaryService.create(product, query);
        uploadedProducts.push(upload);
      }

      const chunks = ChunckData(uploadedProducts);

      for (const chunk of chunks) {
        await this.productRepository.updateProductBatch(chunk);
      }
      return uploadedProducts;
    } catch (error) {
      return null;
    }
  }
}
