import { CategoryEnum } from '@core/common/enum/category.enum';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { parse } from 'JSONStream';
import * as path from 'path';

@Injectable()
export class ReadStreamVetorUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
  ) {}

  public async readFromJson(): Promise<any> {
    const result = [];
    const categories = await this.getAllCategories();

    return new Promise((resolve, reject) => {
      const stream = createReadStream(
        path.join('./src', '@core', 'infra', 'seed', 'data.json'),
      ).pipe(parse('*'));

      stream
        .on('data', (data) => {
          if (
            data['qtdEstoque'] > 0 &&
            Object.values(CategoryEnum).includes(data['nomeLinha'])
          ) {
            const category = categories.find(
              (category) => category.name === data['nomeLinha'],
            );
            const product = this.buildProducts(data, category?.id);
            result.push(product);
          }
        })
        .on('end', () => {
          resolve(result);
        })
        .on('error', (err) => {
          reject(err.message);
        });
    });
  }

  public async getCategoryStream(): Promise<any> {
    const result = [];

    return new Promise((resolve, reject) => {
      const stream = createReadStream(
        path.join(__dirname, '..', 'infra', 'seed', 'data.json'),
      ).pipe(parse('*'));

      stream
        .on('data', (data) => {
          if (data['qtdEstoque'] > 0) {
            result.push(data['nomeLinha']);
          }
        })
        .on('end', () => {
          resolve(result);
        })
        .on('error', (err) => {
          reject(err.message);
        });
    });
  }
  private buildProducts(data, categoryId) {
    const sku = `${data['cdProduto']}-${data['descricao'].replaceAll(
      ' ',
      '-',
    )}`;

    const product = {
      name: data['descricao'],
      slug: data['descricao'].replaceAll(' ', '-'),
      virtual: false,
      downloadable: false,
      description: data['descricao'],
      short_description: data['descricao'],
      sku: sku.toLowerCase(),
      price: data['vlrOferta'].toString(),
      regular_price: data['vlrTabela'].toString(),
      sale_price: data['vlrOferta'].toString(),
      on_sale: true,
      purchasable: true,
      tax_status: 'taxable',
      manage_stock: true,
      stock_quantity: data['qtdEstoque'],
      backorders: 'no',
      backorders_allowed: false,
      backordered: false,
      sold_individually: false,
      shipping_required: true,
      shipping_taxable: true,
      reviews_allowed: true,
      categories: [{ id: categoryId }],
      stock_status: 'instock',
      has_options: false,
      attributes: [
        {
          id: 0,
          name: 'codeBar',
          options: [data['codigoBarras']],
          position: 0,
          visible: false,
          variation: true,
        },
      ],
    };

    return product;
  }

  private async getAllCategories(): Promise<any[]> {
    return await this.woocommerceIntegration.getAllCategories();
  }
}
