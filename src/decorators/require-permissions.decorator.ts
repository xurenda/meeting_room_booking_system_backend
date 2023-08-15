import { SetMetadata } from '@nestjs/common'
import { REQUIRE_PERMISSIONS_KEY } from 'src/guards/permission.guard'

const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions)

export default RequirePermissions
