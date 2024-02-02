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
    for (const item of productsFromWooCommerce) {
      try {
        const code = Number(item.sku.split('-')[0]);

        const streamData = readStreamProducts.find(
          (product) => product.cdProduto === code,
        );

        if (!streamData) {
          productsToUpdate.push({
            id: item.id,
            status: 'draft',
            price: item.price,
            regular_price: item.price,
            sale_price: item.sale_price,
            stock_quantity: 0,
          });
        } else {
          productsToUpdate.push({
            id: item.id,
            status: streamData.qtdEstoque > 0 ? 'publish' : 'draft',
            price: item.price,
            regular_price: item.price,
            sale_price: item.sale_price,
            stock_quantity: streamData.qtdEstoque,
          });
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
}
