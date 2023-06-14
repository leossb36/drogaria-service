import { CategoryEnum, CategoryIdsEnum } from '@core/common/enum/category.enum';

export class AdapterHelper {
  static buildProduct(vetorData) {
    const categoryId = this.formatCategory(vetorData['nomeLinha']);
    const sku = `${vetorData['cdProduto']}-${vetorData['descricao'].replaceAll(
      ' ',
      '-',
    )}`;
    const product = {
      name: vetorData['descricao'],
      slug: vetorData['descricao'].replaceAll(' ', '-'),
      virtual: false,
      downloadable: false,
      description: vetorData['descricao'],
      short_description: vetorData['descricao'],
      sku: sku.toLowerCase(),
      price: vetorData['vlrOferta'].toString(),
      regular_price: vetorData['vlrTabela'].toString(),
      sale_price: vetorData['vlrOferta'].toString(),
      on_sale: true,
      purchasable: true,
      tax_status: 'taxable',
      manage_stock: true,
      stock_quantity: vetorData['qtdEstoque'],
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
          options: [vetorData['codigoBarras']],
          position: 0,
          visible: false,
          variation: true,
        },
      ],
    };

    return product;
  }

  static formatCategory(category) {
    switch (category) {
      case CategoryEnum.CABELO:
        return CategoryIdsEnum.CABELO;
      case CategoryEnum.INFANTIL:
        return CategoryIdsEnum.FRALDAS;
      case CategoryEnum.DERMOCOSMETICOS:
        return CategoryIdsEnum.DERMOCOSMETICOS;
      case CategoryEnum.HIGIENE:
        return CategoryIdsEnum.HIGIENE;
      case CategoryEnum.FRALDAS:
        return CategoryIdsEnum.FRALDAS;
      case CategoryEnum.LEITE:
        return CategoryIdsEnum.FRALDAS;
      case CategoryEnum.MAQUIAGENS:
        return CategoryIdsEnum.MAQUIAGENS;
      case CategoryEnum.PERFUMARIA:
        return CategoryIdsEnum.PERFUMARIA;
      case CategoryEnum.PERFUMES:
        return CategoryIdsEnum.PERFUMARIA;
      default:
        return CategoryIdsEnum.PERFUMARIA;
    }
  }
}
