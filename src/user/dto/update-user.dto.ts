import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsPhoneNumber } from 'class-validator'

class UpdateUserDto {
  @ApiPropertyOptional()
  pic: string

  @ApiPropertyOptional()
  nickName: string

  @ApiPropertyOptional()
  @IsEmail()
  email: string

  @ApiPropertyOptional()
  captcha: string

  @ApiPropertyOptional()
  @IsPhoneNumber('CH')
  phoneNumber: string
}

export default UpdateUserDto
