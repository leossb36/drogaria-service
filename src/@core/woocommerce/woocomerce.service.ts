import { CreateProductWithImagesOnWoocommerce } from './use-case/create-product-with-images-woocommerce.use-case';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GetOrderOnDataBaseUseCase } from './use-case/get-order-on-database.use-case';
import { UpdatedOrderStatusUseCase } from './use-case/update-order-status.use-case';
import { GetOrderVetorUseCase } from '@core/vetor/use-case/get-order-vetor.use-case';
import { ValidationHelper } from '@core/utils/validation-helper';
import { StatusEnum } from '@core/common/enum/status.enum';
import { RetryScrapImageProductUseCase } from './use-case/retry-create-image-product.use-case';
import { UpdateImageProductUseCase } from './use-case/update-image-product.use-case';

@Injectable()
export class WoocommerceService {
  constructor(
    private readonly createProductWithImagesOnWoocommerce: CreateProductWithImagesOnWoocommerce,
    private readonly retryScrapImageProductUseCase: RetryScrapImageProductUseCase,
    private readonly getOrderOnDataBaseUseCase: GetOrderOnDataBaseUseCase,
    private readonly updateImageProductUseCase: UpdateImageProductUseCase,
    private readonly updateOrderStatusUseCase: UpdatedOrderStatusUseCase,
    private readonly getOrderOnVetorUseCase: GetOrderVetorUseCase,
  ) {}

  async createProductRoutineOnWoocommerce() {
    const productsWithImages =
      await this.createProductWithImagesOnWoocommerce.execute();

    if (!productsWithImages.length) {
      return {
        data: [],
        message: 'Cannot find any products to create on woocommerce',
      };
    }
    return {
      data: productsWithImages.length,
      message: 'product created successfully',
    };
  }

  async retryCreateImage() {
    return await this.retryScrapImageProductUseCase.execute();
  }

  async updateImageProduct() {
    return await this.updateImageProductUseCase.execute();
  }

  async updateOrders() {
    try {
      const ordersOnDataBase = await this.getOrderOnDataBaseUseCase.execute();

      if (!ordersOnDataBase.length) {
        return this.emptyCallbackResponse(ordersOnDataBase.length);
      }

      const ordersToUpdate = [];
      for (const order of ordersOnDataBase) {
        const { numeroPedido, cdOrcamento } = order;
        const orderFromVetor = await this.getOrderOnVetorUseCase.execute({
          numeroPedido,
          cdOrcamento,
        });

        if (
          !orderFromVetor ||
          orderFromVetor?.cdOrcamento === StatusEnum.NOT_FOUND
        ) {
          continue;
        }

        ordersToUpdate.push(
          ValidationHelper.setStatus(orderFromVetor, order.numeroPedido),
        );
      }
      return await this.updateOrderStatusUseCase.execute(ordersToUpdate);
    } catch (error) {
      throw new BadRequestException('Cannot update orders', error);
    }
  }

  private emptyCallbackResponse(count: number) {
    return {
      count,
      status: 200,
      message: 'Cannot find any order to update',
    };
  }
}
