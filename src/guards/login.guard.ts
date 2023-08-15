import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { UnloginException } from 'src/filters/unlogin.filter'

export interface JwtAccessToken {
  i: number // id
  n: string // username
  r: string[] // roles
  p: Record<string, number> // permissions
}

export interface JwtRefreshToken {
  i: number // id
}

export const REQUIRE_LOGIN_KEY = 'require_login'

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private readonly reflector: Reflector

  @Inject(JwtService)
  private readonly jwtService: JwtService

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requireLogin = this.reflector.getAllAndOverride<boolean>(REQUIRE_LOGIN_KEY, [
      context.getClass(),
      context.getHandler(),
    ])

    if (!requireLogin) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const authorization = request.headers.authorization

    if (!authorization) {
      throw new UnloginException('未登录')
    }

    try {
      const token = authorization.split(' ')[1]
      const user = this.jwtService.verify<JwtAccessToken>(token)
      request.user = {
        id: user.i,
        username: user.n,
        roles: user.r,
        permissions: user.p,
      }
    } catch (e) {
      throw new UnloginException('token失效')
    }

    return true
  }
}
