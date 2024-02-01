import * as mysql from 'mysql2/promise';
import { Injectable } from '@nestjs/common';
import { RowDataPacket } from 'mysql2/promise';

@Injectable()
export class GetProductsFromWoocommerceUseCase {
  async execute(pool: mysql.Pool, productsSkus?: any[]) {
    return await this.getProductsFromWoocommerce(pool, productsSkus);
  }

  private async getProductsFromWoocommerce(
    pool: mysql.Pool,
    productsSkus?: any[],
  ): Promise<any[]> {
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
        wp.post_type = "product"`,
    );

    const results = (rows as RowDataPacket[]).map((row) => row);

    const filteredResults = results.filter(
      (product) => product.meta_key === '_sku',
    );

    const filteredThumbnails = results.filter(
      (product) => product.meta_key === '_thumbnail_id',
    );

    const productCallBack = filteredResults.map((prd) => {
      const thumbnail = filteredThumbnails.filter(
        (product) => product.id === prd.id,
      );
      return {
        id: prd.id,
        sku: prd.meta_value,
        title: prd.title,
        description: prd.description,
        thumbnail: thumbnail.length ? thumbnail[0].meta_value : undefined,
      };
    });

    if (productsSkus.length) {
      const filteredProducts = productCallBack.filter(
        (prod) =>
          prod.sku === productsSkus.filter((sku) => sku === prod.sku)[0],
      );

      return filteredProducts;
    }

    return productCallBack;
  }
}
