import { Logger } from '@nestjs/common'
import * as mysql from 'mysql2/promise'

export default class MysqlConnection {
  static logger = new Logger(MysqlConnection.name)

  static async connect() {
    try {
      const pool = await mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
      })

      this.logger.debug('Criando pool de conexao')

      return pool
    } catch (error) {
      this.logger.error('Erro ao criar pool de conexao', error.message)
    }
  }

  static async endConnection(pool: mysql.Pool) {
    this.logger.debug('Finalizando pool de conexao')
    pool.end()
  }
}
