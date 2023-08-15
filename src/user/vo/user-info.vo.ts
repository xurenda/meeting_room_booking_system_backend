import { ApiProperty } from '@nestjs/swagger'

class UserInfoVo {
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
}

export default UserInfoVo
