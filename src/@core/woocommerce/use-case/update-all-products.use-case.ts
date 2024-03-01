import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ChunckData } from '@core/utils/fetch-helper';
import { ReadStreamVetorUseCase } from '@core/vetor/use-case/read-stream-vetor.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';

@Injectable()
export class UpdateAllProductsFromVetor {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any> {
    const [readStreamProducts, productsFromWooCommerce] = await Promise.all([
      this.readStreamVetorUseCase.readStream(),
      this.woocommerceIntegration.getAllProducts(),
    ]);

    const productsToUpdate = [];
    for (const item of readStreamProducts) {
      try {
        const referenceItem = productsFromWooCommerce.find(
          (product) => item.cdProduto === Number(product.sku.split('-')[0]),
        );

        if (referenceItem && item.qtdEstoque > 0) {
          productsToUpdate.push({
            id: referenceItem.id,
            status: this.validateStatus(item, referenceItem),
            price: item.vlrTabela.toFixed(2),
            regular_price: item.vlrTabela.toFixed(2),
            sale_price: item.vlrOferta.toFixed(2),
            stock_quantity: item.qtdEstoque,
          });
        } else if (referenceItem && item.qtdEstoque <= 0) {
          productsToUpdate.push({
            id: referenceItem.id,
            status: 'draft',
            price: referenceItem.price,
            regular_price: referenceItem.price,
            sale_price: referenceItem.sale_price,
            stock_quantity: item.qtdEstoque,
          });
        } else if (!referenceItem) {
          continue;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const chunks = ChunckData(productsToUpdate);
    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
      await this.productRepository.updateProductBatch(chunk);
    }

    return {
      count: productsToUpdate.length,
      message: messages.woocommerce.product.update.success,
    };
  }

  validateStatus(streamData: any, item: any) {
    if (
      streamData.qtdEstoque > 0 &&
      item.images.length &&
      item.images[0].id !== 5934
    ) {
      return 'publish';
    }
    return 'draft';
  }
}
