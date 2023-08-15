import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'

class UpdateUserPasswordDto {
  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty()
  @IsNotEmpty()
  captcha: string
}
export default UpdateUserPasswordDto
