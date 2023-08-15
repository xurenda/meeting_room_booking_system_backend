import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { FormatResponseInterceptor } from './interceptors/format-response.interceptor'
import { UnloginFilter } from './filters/unlogin.filter'
import { HttpFilter } from './filters/http.filter'
import { AllFilter } from './filters/all.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new FormatResponseInterceptor())
  // app.useGlobalInterceptors(new InvokeRecordInterceptor())
  app.useGlobalFilters(new UnloginFilter())
  app.useGlobalFilters(new HttpFilter())
  app.useGlobalFilters(new AllFilter())

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API文档')
      .setDescription('API文档')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        description: 'Bearer jwt token',
      })
      .build(),
  )
  SwaggerModule.setup('api-doc', app, document)

  const configService = app.get(ConfigService)
  await app.listen(configService.get('nest_port'))
}
bootstrap()
