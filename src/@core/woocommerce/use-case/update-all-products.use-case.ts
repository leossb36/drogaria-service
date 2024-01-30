import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ChunckData } from '@core/utils/fetch-helper';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { ReadStreamVetorUseCase } from '@core/vetor/use-case/read-stream-vetor.use-case';
import { UpdateProductUseCase } from './update-product.use-case';

@Injectable()
export class UpdateAllProductsFromVetor {
  constructor(
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamVetorUseCase: ReadStreamVetorUseCase,
  ) {}

  async execute(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();

    const [readStreamProducts, productsFromWooCommerce] = await Promise.all([
      this.readStreamVetorUseCase.readFromJson(),
      this.getProductsFromWoocommerceUseCase.execute(pool, []),
    ]);

    await MysqlConnection.endConnection(pool);

    const updateProductOnWoocommerceStock = [];

    const productsWithoutStock = productsFromWooCommerce.filter((product) => {
      return !readStreamProducts.some((stream) => stream.sku === product.sku);
    });

    const woocommerceProductsFullInfo = await this.updateProductUseCase.execute(
      productsWithoutStock,
    );

    for (const item of woocommerceProductsFullInfo) {
      updateProductOnWoocommerceStock.push(item);
    }

    const productsWithStock = productsFromWooCommerce.filter((product) => {
      return readStreamProducts.some((stream) => stream.sku === product.sku);
    });

    for (const item of productsWithStock) {
      const filterStream = readStreamProducts.filter(
        (stream) => stream.sku === item.sku,
      );

      updateProductOnWoocommerceStock.push({
        id: item.id,
        ...filterStream[0],
        status: filterStream[0].stock_quantity > 0 ? 'publish' : 'draft',
      });
    }

    const chunks = ChunckData(updateProductOnWoocommerceStock);
    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
    }

    return {
      count: updateProductOnWoocommerceStock.length,
      message: messages.woocommerce.product.update.success,
    };
  }
}
