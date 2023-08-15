import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    response
      .json({
        code: exception?.getStatus?.() || 500,
        message: 'failed',
        data: exception?.message || '未知错误',
      })
      .end()
  }
}
