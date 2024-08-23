import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { ParseParams } from '@app/modules/utils/functions'
import { Observable } from 'rxjs'

@Injectable()
export class ParseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()

    request.params = ParseParams(request.params)
    request.query = ParseParams(request.query)

    return next.handle()
  }
}
