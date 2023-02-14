import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
import { Product } from '@core/infra/integration/model/product.model';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as messages from '@common/messages/response-messages.json';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly vetorIntegration: VetorIntegrationGateway,
  ) {}

  async execute(): Promise<unknown> {
    let total = 0;

    const productsFromVetor = await this.vetorIntegration.getProductInfo(
      '/produtos/consulta',
    );

    for (const product of productsFromVetor.data) {
      try {
        await this.woocommerceIntegration.createProduct(this.fromTo(product));
        total += 1;
      } catch (error) {
        console.error(error.response.data);
        throw new BadRequestException(
          `${messages.woocommerce.Product.create.error}: ${error.response.data}`,
        );
      }
    }

    return {
      total: total,
      message: messages.woocommerce.Product.create.success,
    };
  }

  private fromTo(productFromVetor: Product): getProductWooCommerce {
    const sku = `${
      productFromVetor.cdProduto
    }-${productFromVetor.descricao.replace(' ', '_')}`;
    return {
      name: productFromVetor.descricao,
      slug: productFromVetor.descricao.replace(' ', '-'),
      description: productFromVetor.descricao,
      short_description: productFromVetor.descricao,
      sku: sku,
      price: productFromVetor.vlrOferta.toString(),
      regular_price: productFromVetor.vlrTabela.toString(),
      sale_price: productFromVetor.vlrOferta.toString(),
      on_sale: true,
      purchasable: true,
      virtual: false,
      downloadable: false,
      tax_status: 'taxable',
      manage_stock: false,
      stock_quantity: productFromVetor.qtdEstoque,
      backorders: 'no',
      backorders_allowed: false,
      backordered: false,
      sold_individually: false,
      shipping_required: true,
      shipping_taxable: true,
      reviews_allowed: true,
      categories: [
        {
          id: productFromVetor.cdCategoria,
          name: productFromVetor.nomeCategoria,
          slug: productFromVetor.nomeCategoria.toLowerCase(),
        },
      ],
      stock_status: 'instock',
      has_options: false,
    } as getProductWooCommerce;
  }
}
