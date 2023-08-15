import { ApiProperty } from '@nestjs/swagger'
import UserInfoVo from './user-info'

class Pagination {
  @ApiProperty()
  pageNo: number

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  totalPage: number
}

class UserListVo extends Pagination {
  @ApiProperty({ type: [UserInfoVo] })
  users: UserInfoVo[]
}

export default UserListVo
