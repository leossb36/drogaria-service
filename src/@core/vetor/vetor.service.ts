import { getProductWooCommerceModelView } from '@core/woocommerce/mv/get-product-woo.mv';
import { ListProductVetorUseCase } from './use-case/list-product-vetor.use-case';
import { CloudinaryService } from '@core/cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VetorService {
  constructor(
    private readonly listProductVetorUseCase: ListProductVetorUseCase,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getProduct(skip = 0, limit = 100) {
    try {
      const products: getProductWooCommerceModelView[] =
        await this.listProductVetorUseCase.execute();
      const productsCodeBars = products
        .map((product) => product.attributes[0]?.options[0])
        .slice(skip, limit);

      return productsCodeBars;
    } catch (error) {
      throw error;
    }
  }
}
