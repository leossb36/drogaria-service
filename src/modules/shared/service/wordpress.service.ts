import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import * as mysql from 'mysql2/promise'

@Injectable()
export class WordpressService {
  private readonly logger = new Logger(WordpressService.name)
  async addImage(pool: mysql.Pool, productId: any) {
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    try {
      const notfoundId = 5934
      await connection.query(
        'INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)',
        [productId, '_thumbnail_id', notfoundId]
      )

      await connection.query(`UPDATE wp_posts SET post_status = 'draft' where ID = ${productId}`)

      await connection.commit()
      this.logger.debug(`Imagem padrao adicionada ao produto ${productId}`)
    } catch (error) {
      await connection.rollback()
      this.logger.error(`Falha ao inserir imagem padrao ao ID: ${productId}`, error.message)
    }
  }

  async getProducts(pool: mysql.Pool, productsSkus?: any[]) {
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
      throw new InternalServerErrorException(error.message)
    }
  }
}
