import { ApiProperty } from '@nestjs/swagger'
import TokensVo from './tokens.vo'

class UserInfo {
  @ApiProperty()
  id: number

  @ApiProperty()
  username: string

  @ApiProperty()
  nickName: string

  @ApiProperty()
  email: string

  @ApiProperty()
  pic: string

  @ApiProperty()
  phoneNumber: string

  @ApiProperty()
  isFrozen: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  roles: string[]

  @ApiProperty()
  permissions: Record<string, number>
}

class UserWithTokensVo extends TokensVo {
  @ApiProperty()
  userInfo: UserInfo
}

export default UserWithTokensVo
