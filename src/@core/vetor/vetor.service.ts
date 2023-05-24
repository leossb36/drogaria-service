import { getProductWooCommerceModelView } from '@core/woocommerce/mv/get-product-woo.mv';
import { ListProductVetorUseCase } from './use-case/list-product-vetor.use-case';
import { CloudinaryService } from '@core/cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VetorService {
  constructor(
    private readonly listProductVetorUseCase: ListProductVetorUseCase,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  /**
   * pegar os itens; ok
   * pra cada item eu faço o scrap ok
   * salvar no mongodb de acordo com o codigo de barra;
   * faço o recize das imagens pra 500x500; tenho que ajustar o script para poder puxar a imagem pela url
   * upload do arquivo no cloudinary;
   * faço o cadastro dos produtos no woocommerce sem imagem; ok
   * faço o update dos produtos utilizando a url do cloudinary; partial
   *
   * OBS tenho que cadastrar no cloudinary utilizando uma chave composta - codigoDeBarras | sku
   * isso me garante que quando o produto nao tiver codigo de barras eu puxo a imagem pela sku
   *
   * OBS no scrapper eu tenho que dar a opção primaria de puxar pelo codigo de barras ok
   *
   * Preciso orquestrar o envio pro banco para nao estourar o throughput da serpapi
   */
  async saveProductInfo() {
    try {
      const products: getProductWooCommerceModelView[] =
        await this.listProductVetorUseCase.execute();

      return products;
    } catch (error) {
      throw error;
    }
  }
}
