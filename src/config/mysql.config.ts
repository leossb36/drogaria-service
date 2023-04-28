import * as mysql from 'mysql2/promise';

export default class MysqlConnection {
  static async connect() {
    const pool = await mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    });

    console.log('Connected on database');

    return pool;
  }

  static async endConnection(pool: mysql.Pool) {
    console.log('Ending connection on pool');
    pool.end();
  }
}
