import { Injectable } from '@nestjs/common';
import { GetProductModelView } from './mv/get-product.mv';
import { GetProductWoocommerceModelView } from './mv/get-product-woo.mv';

@Injectable()
export class ProductAdapter {
  update(
    foundProduct: GetProductWoocommerceModelView,
    streamProduct: GetProductModelView,
  ): GetProductWoocommerceModelView {
    return {
      id: foundProduct.id,
      status: this.validateStatus(foundProduct, streamProduct),
      price: streamProduct.vlrTabela.toFixed(2),
      regular_price: streamProduct.vlrTabela.toFixed(2),
      sale_price: streamProduct.vlrOferta.toFixed(2),
      stock_quantity: streamProduct.qtdEstoque,
    };
  }

  draft(
    foundProduct: GetProductWoocommerceModelView,
    streamProduct: GetProductModelView,
  ): GetProductWoocommerceModelView {
    return {
      id: foundProduct.id,
      status: 'draft',
      price: foundProduct.price,
      regular_price: foundProduct.price,
      sale_price: foundProduct.sale_price,
      stock_quantity: streamProduct.qtdEstoque,
    };
  }

  private validateStatus(
    foundProduct: GetProductWoocommerceModelView,
    streamProduct: GetProductModelView,
  ) {
    if (
      streamProduct.qtdEstoque > 0 &&
      foundProduct.images.length &&
      foundProduct.images[0].id !== 5934
    ) {
      return 'publish';
    }
    return 'draft';
  }
}
