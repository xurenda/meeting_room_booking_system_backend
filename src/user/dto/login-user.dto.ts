import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}

export default LoginUserDto
