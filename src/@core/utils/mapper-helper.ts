import { Product } from '@core/application/dto/product.dto';
import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';

export default function FromTo(
  productFromVetor: Product,
): getProductWooCommerce {
  const sku = `${
    productFromVetor.cdProduto
  }-${productFromVetor.descricao.replaceAll(' ', '-')}`;

  return {
    name: productFromVetor.descricao,
    slug: productFromVetor.descricao.replaceAll(' ', '-'),
    description: productFromVetor.descricao,
    short_description: productFromVetor.descricao,
    sku: sku.toLowerCase(),
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
  };
}
