import { BadRequestException, ParseIntPipe } from '@nestjs/common'

function generateParseIntPipe(name: string) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(`${name} 需要是一个整数`)
    },
  })
}

export default generateParseIntPipe
