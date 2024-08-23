import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { WordpressService } from '@app/modules/shared/service/wordpress.service'
import { WcService } from '@app/modules/shared/service/woocommerce.service'
import { VetorService } from '@app/modules/shared/service/vetor.service'
import { ProductRepository } from '../repositories/product.repository'
import { ChunckData } from '@app/modules/utils/fetch-data'
import MysqlConnection from '@app/config/db.config'

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)
  constructor(
    private readonly wcService: WcService,
    private readonly vetorService: VetorService,
    private readonly wordpressService: WordpressService,
    private readonly productRepository: ProductRepository
  ) {}

  async readStream(): Promise<any> {
    try {
      return await this.vetorService.readStream()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async getProducts(pool: any, skus: any[]) {
    try {
      return await this.wordpressService.getProducts(pool, skus)
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async getAllProducts() {
    try {
      return await this.productRepository.getAllProducts()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async createProducts(): Promise<void | null> {
    try {
      const pool = await MysqlConnection.connect()

      const [streamData, wcProducts] = await Promise.all([
        this.readStream(),
        this.getProducts(pool, [])
      ])

      await MysqlConnection.endConnection(pool)

      if (!streamData.length) {
        return null
      }

      const productsToCreate = streamData.filter(stream => {
        return !wcProducts.some(prd => prd.sku === stream.sku)
      })

      if (!productsToCreate.length) {
        return null
      }

      const chunks = ChunckData(productsToCreate)

      for (const chunk of chunks) {
        await this.wcService.createProductBatch(chunk)
        const productInDb = await this.productRepository.getProducts(
          chunk.map(product => product.sku)
        )

        const productsNotInDb = chunk.filter(product => {
          return !productInDb.some(prod => prod.sku === product.sku)
        })

        if (!productsNotInDb.length) {
          continue
        } else {
          await this.productRepository.createMany(productsNotInDb)
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async saveOnStream(): Promise<void> {
    try {
      await this.vetorService.saveOnStream()
    } catch (error) {
      this.logger.error('Erro ao salvar documento de produtos:', error.message)
    }
  }

  async updateProducts(): Promise<void> {
    try {
      const [readStreamProducts, productsFromWooCommerce] = await Promise.all([
        this.readStream(),
        this.wcService.getAllProducts()
      ])

      const productsToUpdate = []

      for (const item of readStreamProducts) {
        const referenceItem = productsFromWooCommerce.find(
          product => item.cdProduto === Number(product.sku.split('-')[0])
        )

        if (referenceItem && item.qtdEstoque > 0) {
          productsToUpdate.push({
            id: referenceItem.id,
            status: this.validateStatus(referenceItem, item),
            price: item.vlrTabela.toFixed(2),
            regular_price: item.vlrTabela.toFixed(2),
            sale_price: item.vlrOferta.toFixed(2),
            stock_quantity: item.qtdEstoque,
            attributes: [
              {
                id: 0,
                name: 'BARCODE',
                options: [item.codigoBarras],
                position: 0,
                visible: false,
                variation: true
              },
              {
                id: 0,
                name: 'EAN',
                options: [item.codigoBarras],
                position: 0,
                visible: true,
                variation: true
              },
              {
                id: 0,
                name: 'GTIN',
                options: [item.codigoBarras],
                position: 0,
                visible: true,
                variation: true
              }
            ]
          })
        } else if (referenceItem && item.qtdEstoque <= 0) {
          productsToUpdate.push({
            id: referenceItem.id,
            status: 'draft',
            price: referenceItem.price,
            regular_price: referenceItem.price,
            sale_price: referenceItem.sale_price,
            stock_quantity: item.qtdEstoque,
            attributes: [
              {
                id: 0,
                name: 'BARCODE',
                options: [item.codigoBarras],
                position: 0,
                visible: false,
                variation: true
              },
              {
                id: 0,
                name: 'EAN',
                options: [item.codigoBarras],
                position: 0,
                visible: false,
                variation: true
              },
              {
                id: 0,
                name: 'GTIN',
                options: [item.codigoBarras],
                position: 0,
                visible: false,
                variation: true
              }
            ]
          })
        } else if (!referenceItem) {
          continue
        }
      }

      const chunks = ChunckData(productsToUpdate)
      for (const chunk of chunks) {
        await this.wcService.updateProductBatch(chunk)
        await this.productRepository.updateProducts(chunk)
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async updateImageProduct(): Promise<void> {
    try {
      const pool = await MysqlConnection.connect()

      const wcProducts = await this.getProducts(pool, [])

      const productsToUpdateImage = wcProducts.filter(product => !product.thumbnail)

      if (!productsToUpdateImage.length) {
        await MysqlConnection.endConnection(pool)
      }

      const mongoProducts = (
        await this.productRepository.getProducts(productsToUpdateImage.map(prod => prod.sku))
      ).slice(0, 5)

      const payloads = mongoProducts.map(mongoPrd => {
        const wooProduct = productsToUpdateImage.find(wooPrd => wooPrd.sku === mongoPrd.sku)
        return {
          id: wooProduct.id,
          images: mongoPrd.images,
          stock_quantity: mongoPrd.stock_quantity
        }
      })
      for (const product of payloads) {
        await Promise.all([this.wcService.createMedia(product, pool)])
      }
      await MysqlConnection.endConnection(pool)
    } catch (error) {
      this.logger.error('Falha ao atualizar imagens de produtos', error.message)
    }
  }

  async createCategories(): Promise<void> {
    try {
      const categories = await this.vetorService.getCategories()
      await this.wcService.createCategories(categories)

      await this.productRepository.createCategories(categories as any)
    } catch (error) {
      this.logger.error('Error to create categories:', error.message)
    }
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    try {
      return await this.productRepository.getCategories()
    } catch (error) {
      this.logger.error('Error ao listar categorias:', error.message)
    }
  }

  async syncCategories(): Promise<void> {
    try {
      const wooCategories = await this.wcService.getCategories()

      for (const category of wooCategories.data) {
        await this.productRepository.syncCategories(category)
      }

      this.logger.log('Categorias atualizadas com sucesso')
    } catch (error) {
      this.logger.error('Error ao listar categorias:', error.message)
    }
  }

  validateStatus(referenceItem: any, item: any) {
    if (item.qtdEstoque > 0 && referenceItem.images.length && referenceItem.images[0].id !== 5934) {
      return 'publish'
    }
    return 'draft'
  }
}
