import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ChunckData } from '@core/utils/fetch-helper';
import { ReadStreamService } from '@core/utils/read-stream';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';
import { GetProductsFromWoocommerceUseCase } from '../wordpress/get-products-from-woocommerce.use-case';

@Injectable()
export class UpdateAllProductsFromVetor {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamService: ReadStreamService,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
  ) {}

  async execute(): Promise<any> {
    const readStreamProducts = await this.readStreamService.getAll();

    const pool: mysql.Pool = await MysqlConnection.connect();

    const productsFromWooCommerce =
      await this.getProductsFromWoocommerceUseCase.execute(pool, []);

    const updateProductOnWoocommerceStock = [];

    for (const item of productsFromWooCommerce) {
      const filterStream = readStreamProducts.filter(
        (stream) => stream.sku === item.sku,
      );
      if (!filterStream.length) continue;
      updateProductOnWoocommerceStock.push({
        id: item.id,
        stock_quantity: filterStream[0].stock_quantity,
        categories: filterStream[0].categories,
        attributes: filterStream[0].attributes,
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
