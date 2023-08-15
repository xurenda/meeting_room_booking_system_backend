import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { Request, Response } from 'express'

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp()
    const request = httpCtx.getRequest<Request>()
    const response = httpCtx.getResponse<Response>()

    const userAgent = request.headers['user-agent']
    const { ip, method, path } = request
    this.logger.debug(
      `${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
        context.getHandler().name
      } invoked...`,
    )
    this.logger.debug(`user: ${request.user?.id}, ${request.user?.username}`)

    const now = Date.now()
    return next.handle().pipe(
      tap(res => {
        this.logger.debug(
          `${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
        )
        this.logger.debug(`Response: ${JSON.stringify(res)}`)
      }),
    )
  }
}
