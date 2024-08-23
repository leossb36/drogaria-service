import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { GetOrderModelView } from '@app/modules/orders/model-views/get-order.mv'
import { CategoryEnum, CategoryIdsEnum } from '../enum/category.enum'
import { ConfigService } from '@config/configuration.config'
import { QueryFilter } from '@app/modules/utils/builder'
import { createReadStream, createWriteStream } from 'fs'
import { setDelay } from '@app/modules/utils/functions'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'
import { parse } from 'JSONStream'
import { Readable } from 'stream'
import * as path from 'path'

@Injectable()
export class VetorService {
  private readonly logger = new Logger(VetorService.name)
  private baseUrl: string
  private headerRequest
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.baseUrl = this.configService.get('api').url
    this.headerRequest = {
      Authorization: `${this.configService.get('api').prefix} ${
        this.configService.get('api').token
      }`
    }
  }

  async getProductInfo(endpoint: string, params?: any): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params
        })
      )

      return response.data
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  async getOrderInfo(params: GetOrderModelView, endpoint: string): Promise<any> {
    try {
      await setDelay(1000)
      const { data } = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params
        })
      )

      return data
    } catch (error) {
      this.logger.error(error.response.data)
    }
  }

  async createOrder(body: unknown, endpoint: string): Promise<any> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}${endpoint}`, body, {
          headers: this.headerRequest
        })
      )
      return data
    } catch (error) {
      this.logger.error(error.response.data)
    }
  }

  async getCategories() {
    try {
      await this.saveOnStream()
      const stream = await this.readFromVetor()

      const categoryMap = stream.reduce((acc, data) => {
        const name = data['nomeLinha']

        if (!acc[name]) {
          acc[name] = { name }
        }

        return acc
      }, {})

      const categories = Object.values(categoryMap)

      return categories
    } catch (error) {
      this.logger.error(error)
    }
  }

  async saveOnStream(): Promise<void> {
    try {
      const queryFilter = new QueryFilter()
      const productStream = []
      const queryTop = 500
      let querySkip = 0
      let queryCounter = 0

      const writebleStream = createWriteStream(
        path.join('./src', 'modules', 'shared', 'seeds', 'data.json'),
        { flags: 'w' }
      )

      const query = queryFilter.setFilters().getQuery()

      const { total } = await this.getProductInfo('/produtos/consulta', {
        $filter: query,
        $count: 'true'
      })

      do {
        try {
          await setDelay(1000)
          const response = await this.getProductInfo('/produtos/consulta', {
            $top: queryTop,
            $skip: querySkip,
            $filter: query
          })

          queryCounter += response.data.length
          querySkip = queryCounter

          const readStream = Readable.from(response.data, { objectMode: true })
          readStream
            .on('data', data => {
              productStream.push(data)
            })
            .on('error', error => {
              this.logger.error('error while trying resolve file', error)
            })
        } catch (error) {
          this.logger.error(error)
        }
      } while (productStream.length < total)
      writebleStream.write(JSON.stringify(productStream, null, 2))
    } catch (error) {
      throw new InternalServerErrorException('Falha ao criar arquivo', error.message)
    }
  }

  public async readStream(): Promise<any[]> {
    const result = []

    return new Promise((resolve, reject) => {
      const stream = createReadStream(
        path.join('./src', 'modules', 'shared', 'seeds', 'data.json')
      ).pipe(parse('*'))

      stream
        .on('data', data => {
          if (Object.values(CategoryEnum).includes(data['nomeLinha'])) {
            const categoryId = this.formatCategory(data['nomeLinha'])
            const sku = `${data['cdProduto']}`
            const product = this.buildProducts(data, categoryId, sku)
            result.push(product)
          }
        })
        .on('end', () => {
          resolve(result)
        })
        .on('error', err => {
          reject(err.message)
        })
    })
  }

  public async readFromVetor(): Promise<any[]> {
    const result = []

    return new Promise((resolve, reject) => {
      const stream = createReadStream(
        path.join('./src', 'modules', 'shared', 'seeds', 'data.json')
      ).pipe(parse('*'))

      stream
        .on('data', data => {
          if (Object.values(CategoryEnum).includes(data['nomeLinha'])) {
            result.push(data)
          }
        })
        .on('end', () => {
          resolve(result)
        })
        .on('error', err => {
          reject(err.message)
        })
    })
  }

  private buildProducts(data, categoryId, sku) {
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
      categories: [{ id: +categoryId }],
      stock_status: 'instock',
      has_options: false,
      attributes: [
        {
          id: 0,
          name: 'BARCODE',
          options: [data['codigoBarras']],
          position: 0,
          visible: false,
          variation: true
        },
        {
          id: 0,
          name: 'EAN',
          options: [data['codigoBarras']],
          position: 0,
          visible: true,
          variation: true
        },
        {
          id: 0,
          name: 'GTIN',
          options: [data['codigoBarras']],
          position: 0,
          visible: true,
          variation: true
        }
      ],
      images: []
    }

    return product
  }

  private formatCategory(category) {
    switch (category) {
      case CategoryEnum.CABELO:
        return CategoryIdsEnum.CABELO
      case CategoryEnum.INFANTIL:
        return CategoryIdsEnum.FRALDAS
      case CategoryEnum.DERMOCOSMETICOS:
        return CategoryIdsEnum.DERMOCOSMETICOS
      case CategoryEnum.HIGIENE:
        return CategoryIdsEnum.HIGIENE
      case CategoryEnum.FRALDAS:
        return CategoryIdsEnum.FRALDAS
      case CategoryEnum.LEITE:
        return CategoryIdsEnum.FRALDAS
      case CategoryEnum.MAQUIAGENS:
        return CategoryIdsEnum.MAQUIAGENS
      case CategoryEnum.PERFUMES:
        return CategoryIdsEnum.PERFUMES
      default:
        return CategoryIdsEnum.PERFUMES
    }
  }
}
