import { ApiProperty } from '@nestjs/swagger'

class TokensVo {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string
}

export default TokensVo
