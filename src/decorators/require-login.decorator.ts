import { SetMetadata } from '@nestjs/common'
import { REQUIRE_LOGIN_KEY } from 'src/guards/login.guard'

const RequireLogin = () => SetMetadata(REQUIRE_LOGIN_KEY, true)

export default RequireLogin
