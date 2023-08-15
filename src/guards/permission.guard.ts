import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { Reflector } from '@nestjs/core'

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions'

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private readonly reflector: Reflector

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requirePermissions = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getClass(),
      context.getHandler(),
    ])
    if (!requirePermissions?.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const permissions = request.user?.permissions || {}

    requirePermissions.forEach(permission => {
      if (!permissions[permission]) {
        throw new UnauthorizedException('权限不足')
      }
    })

    return true
  }
}
