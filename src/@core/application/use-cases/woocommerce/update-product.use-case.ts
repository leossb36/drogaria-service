import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { ReadStreamService } from '@core/utils/read-stream';
import { ChunckData } from '@core/utils/fetch-helper';
import { GetProductsFromWoocommerceUseCase } from '../wordpress/get-products-from-woocommerce.use-case';
import MysqlConnection from '@config/mysql.config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly readStreamService: ReadStreamService,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
  ) {}

  async execute(): Promise<any> {
    const pool: mysql.Pool = await MysqlConnection.connect();
    const updatedProducts = [];
    const wooProducts = await this.getProductsFromWoocommerceUseCase.execute(
      pool,
    );

    if (!wooProducts.length) {
      throw new BadRequestException('Cannot find any products');
    }

    const formatedProductsFromVetor =
      await this.readStreamService.filterProductsVetor();

    wooProducts.map((product) => {
      const formatedProduct = formatedProductsFromVetor.find(
        (formatedProduct) => formatedProduct.nome === product.name,
      );
      updatedProducts.push({
        id: product.id,
        stock_quantity: formatedProduct.qtdEstoque,
      });
    });
    const chunks = ChunckData(updatedProducts);

    for (const chunk of chunks) {
      await this.woocommerceIntegration.updateProductBatch(chunk);
    }

    return {
      count: updatedProducts.length,
      message: messages.woocommerce.product.update.success,
    };
  }
}
