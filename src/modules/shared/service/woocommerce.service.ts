import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import { FetchAllProducts } from '@app/modules/utils/fetch-data'
import { ConfigService } from '@config/configuration.config'
import { WordpressService } from './wordpress.service'
import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import * as mysql from 'mysql2/promise'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class WcService {
  private readonly woocommerceConfig
  private readonly logger = new Logger(WcService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly wordpressService: WordpressService
  ) {
    this.woocommerceConfig = new WooCommerceRestApi({
      url: this.configService.get('woocommerce').url,
      consumerKey: this.configService.get('woocommerce').consumerKey,
      consumerSecret: this.configService.get('woocommerce').consumerSecret,
      version: 'wc/v3'
    })
  }

  async getOrders(): Promise<any> {
    try {
      const response = await this.woocommerceConfig.get('orders?status=processing')
      return response.data
    } catch (error) {
      this.logger.error('Error ao buscar pedidos:', error.message)
    }
  }

  async getProducts(pool: mysql.Pool, productsSkus?: any[]): Promise<any[]> {
    try {
      const [rows] = await pool.query(
        `SELECT
          wp.ID as id,
          wp.post_title as title,
          wp.post_content as description,
          wp2.meta_key,
          wp2.meta_value
        FROM
          wp_posts wp
        INNER JOIN wp_postmeta wp2 ON
          wp2.post_id = wp.ID
        WHERE
          wp.post_type = "product"`
      )

      const results = (rows as mysql.RowDataPacket[]).map(row => row)

      const filteredResults = results.filter(product => product.meta_key === '_sku')

      const filteredThumbnails = results.filter(product => product.meta_key === '_thumbnail_id')

      const productCallBack = filteredResults.map(prd => {
        const thumbnail = filteredThumbnails.filter(product => product.id === prd.id)
        return {
          id: prd.id,
          sku: prd.meta_value,
          title: prd.title,
          description: prd.description,
          thumbnail: thumbnail.length ? thumbnail[0].meta_value : undefined
        }
      })

      if (productsSkus.length) {
        const filteredProducts = productCallBack.filter(
          prod => prod.sku === productsSkus.filter(sku => sku === prod.sku)[0]
        )

        return filteredProducts
      }

      return productCallBack
    } catch (error) {
      this.logger.error('Error ao buscar produtos:', error.message)
    }
  }

  async getAllProducts(): Promise<any> {
    try {
      const response = await FetchAllProducts(this.woocommerceConfig)
      return response
    } catch (error) {
      this.logger.error('Error ao buscar todos os produtos:', error.message)
    }
  }

  async getAllProductsByIds(ids: any[]): Promise<any> {
    try {
      const response = await FetchAllProducts(this.woocommerceConfig)
      const filtered = response.filter(product => ids.includes(product.id))
      return filtered
    } catch (error) {
      this.logger.error('Error ao buscar todos os produtos por id:', error.message)
    }
  }

  async productById(id: string): Promise<any> {
    try {
      const response = await this.woocommerceConfig.get(`products/${id}`)
      return response
    } catch (error) {
      this.logger.error('Error ao buscar produto por id:', error.message)
    }
  }

  async updateOrderStatus(orderId: number, orderStatus: string): Promise<any> {
    try {
      const data = {
        status: orderStatus
      }
      const response = await this.woocommerceConfig.put(`orders/${orderId}`, data)
      return response
    } catch (error) {
      this.logger.error('Error ao atualizar status do pedido:', error.message)
    }
  }

  async getAllProductsSku(): Promise<string[]> {
    try {
      const skus = await FetchAllProducts(this.woocommerceConfig).then(result => {
        return result.map(product => product.sku)
      })

      return skus
    } catch (error) {
      this.logger.error('Error ao buscar todos os produtos por sku:', error.message)
    }
  }

  async createProductBatch(products: any[]): Promise<any> {
    const data = {
      create: products.map(product => ({
        ...product,
        status: product.stock_quantity > 0 && product.images.length ? 'publish' : 'draft'
      }))
    }
    try {
      const response = await this.woocommerceConfig.post('products/batch', data)
      return response.data
    } catch (error) {
      this.logger.error('Error ao criar produtos em massa:', error.message)
    }
  }

  async createCategories(categories: any[]): Promise<any> {
    const data = {
      create: [...categories]
    }
    try {
      const response = await this.woocommerceConfig.post('products/categories/batch', data)
      return response
    } catch (error) {
      this.logger.error('Error ao criar categorias em massa:', error.message)
    }
  }

  async getCategories(): Promise<any> {
    try {
      const response = await this.woocommerceConfig.get('products/categories')
      return response
    } catch (error) {
      this.logger.error('Error ao criar categorias em massa:', error.message)
    }
  }

  async updateProductBatch(products: any) {
    const data = {
      update: [...products]
    }
    try {
      const response = await this.woocommerceConfig.post('products/batch', data)
      return response
    } catch (error) {
      this.logger.error('Error ao processar dados para atualizar no woocommerce:', error.message)
    }
  }

  async createMedia(product: any, pool: mysql.Pool) {
    const consumerKey = this.configService.get('woocommerce').consumerKey
    const consumerSecret = this.configService.get('woocommerce').consumerSecret
    const url = `${this.configService.get('woocommerce').url}/wp-json/wc/v3`
    const endpoint = 'products'

    const body = {
      images: [{ src: product.images[0].src }],
      status: product.stock_quantity > 0 ? 'publish' : 'draft'
    }

    try {
      const response = await lastValueFrom(
        this.httpService.patch(
          `${url}/${endpoint}/${product.id}`,
          { ...body },
          {
            headers: { 'Accept-Encoding': '*' },
            auth: {
              username: consumerKey,
              password: consumerSecret
            },
            timeout: 15000
          }
        )
      )

      return response.data
    } catch (error) {
      this.logger.error('Erro ao processar imagem para criar midia', error.message)
      await this.wordpressService.addImage(pool, product.id)
    }
  }
}
