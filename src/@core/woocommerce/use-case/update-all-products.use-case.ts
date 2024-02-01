import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ChunckData } from '@core/utils/fetch-helper';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { ReadStreamVetorUseCase } from '@core/vetor/use-case/read-stream-vetor.use-case';
import { ProductRepository } from '@core/infra/db/repositories/product.repository';
import { AdapterHelper } from '@core/utils/adapter-helper';

@Injectable()
export class UpdateAllProductsFromVetor {
  constructor(
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const [readStreamProducts, productsFromWooCommerce] = await Promise.all([
      this.readStreamVetorUseCase.readStream(),
      this.getProductsFromWoocommerceUseCase.execute(pool, []),
    ]);

    await MysqlConnection.endConnection(pool);

    const productsToUpdate = [];
    for (const item of productsFromWooCommerce) {
      try {
        const code = Number(item.sku.split('-')[0]);

        const streamData = readStreamProducts.find(
          (product) => product.cdProduto === code,
        );

        if (!streamData) {
          productsToUpdate.push({
            ...item,
            status: 'draft',
          });
        } else {
          const data = AdapterHelper.buildProduct(streamData);

          productsToUpdate.push({
            id: item.id,
            status: data.stock_quantity > 0 ? 'publish' : 'draft',
            ...data,
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
