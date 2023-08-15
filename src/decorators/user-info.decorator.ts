import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

export type TUserInfo = Request['user']

const UserInfo = createParamDecorator((data: keyof Request['user'], ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return data ? request.user[data] : request.user
})

export default UserInfo
