import { getProductWooCommerceModelView } from '@core/woocommerce/mv/get-product-woo.mv';
import { ListProductVetorUseCase } from './use-case/list-product-vetor.use-case';
import { CloudinaryService } from '@core/cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';
import { GetProductDataBaseUseCase } from './use-case/get-product-database.use-case';
import { CreateProductUseCaseOnMongo } from './use-case/create-product-mongo.use-case';
import { ScrapImagesUseCase } from './use-case/scrap-image-to-product.use-case';
import { UploadCloudinaryUseCase } from './use-case/upload-cloudinary.use-case';

@Injectable()
export class VetorService {
  constructor(
    private readonly listProductVetorUseCase: ListProductVetorUseCase,
    private readonly getProductDataBaseUseCase: GetProductDataBaseUseCase,
    private readonly createProductUseCaseOnMongo: CreateProductUseCaseOnMongo,
    private readonly uploadCloudinaryUseCase: UploadCloudinaryUseCase,
    private readonly scrapImagesUseCase: ScrapImagesUseCase,
  ) {}
  /**
   * pegar os itens; ok
   * pra cada item eu faço o scrap ok
   * salvar no mongodb de acordo com o codigo de barra; ok
   * faço o recize das imagens pra 500x500 - propriamente no cloudinary; ok
   * upload do arquivo no cloudinary; ok
   * faço o cadastro dos produtos no woocommerce sem imagem; ok
   * faço o update dos produtos utilizando a url do cloudinary; partial
   *
   * OBS tenho que cadastrar no cloudinary utilizando uma chave composta - codigoDeBarras | sku ok
   * isso me garante que quando o produto nao tiver codigo de barras eu puxo a imagem pela sku ok
   *
   * OBS no scrapper eu tenho que dar a opção primaria de puxar pelo codigo de barras ok
   *
   * Preciso orquestrar o envio pro banco para nao estourar o throughput da serpapi ok
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

  async saveOnBlobStorage() {
    try {
      const vetorProducts = await this.listProductVetorUseCase.execute();
      const mongoProducts = await this.getProductDataBaseUseCase.execute(
        vetorProducts.map((prd) => prd.sku),
      );

      const products = vetorProducts
        .filter((prod) => {
          return !mongoProducts.some((mongo) => mongo.sku === prod.sku);
        })
        .slice(0, 3);

      await this.createProductUseCaseOnMongo.execute(products);
      const scrapImages = await this.scrapImagesUseCase.execute(products, 1);

      return await this.uploadCloudinaryUseCase.execute(scrapImages);
    } catch (error) {
      throw error;
    }
  }
}
