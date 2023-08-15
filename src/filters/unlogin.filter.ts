import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

export class UnloginException extends Error {
  constructor(message = '未登录') {
    super(message)
    this.name = 'UnloginException'
  }
}

@Catch(UnloginException)
export class UnloginFilter implements ExceptionFilter {
  catch(exception: UnloginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    response
      .json({
        code: HttpStatus.UNAUTHORIZED,
        message: 'failed',
        data: exception.message,
      })
      .end()
  }
}
