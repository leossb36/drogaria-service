import * as mysql from 'mysql2/promise';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateImageOnWordpressUseCase {
  async addImage(pool: mysql.Pool, productId: any) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const notfoundId = 5934;
      await connection.query(
        'INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)',
        [productId, '_thumbnail_id', notfoundId],
      );

      await connection.query(
        `UPDATE wp_posts SET post_status = 'draft' where ID = ${productId}`,
      );

      await connection.commit();
      return { success: true };
    } catch (err) {
      await connection.rollback();
      return { success: false, message: err.message };
    }
  }
}
