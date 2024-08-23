import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { PrismaService } from '@app/infra/db/prisma/prisma.service'
import { tap, catchError, finalize } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Injectable()
export class DbInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DbInterceptor.name)

  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    try {
      this.logger.debug('Connecting to database...')
      await this.prisma.$connect()

      return next.handle().pipe(
        tap(() => {
          this.logger.debug('Successfully handled request.')
        }),
        catchError(error => {
          this.logger.error('Error while handling request.', error)
          throw error
        }),
        finalize(async () => {
          this.logger.debug('Disconnecting from database...')
          await this.prisma.$disconnect()
        })
      )
    } catch (error) {
      this.logger.error('Error while connecting to database.', error)
      await this.prisma.$disconnect()
      throw error
    }
  }
}
