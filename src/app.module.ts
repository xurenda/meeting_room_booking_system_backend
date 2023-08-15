import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { RedisModule } from './redis/redis.module'
import { EmailModule } from './email/email.module'
import path from 'node:path'
import { APP_GUARD } from '@nestjs/core'
import { LoginGuard } from './guards/login.guard'
import { PermissionGuard } from './guards/permission.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(__dirname, '.env')],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_host'),
          port: configService.get('mysql_port'),
          username: configService.get('mysql_username'),
          password: configService.get('mysql_password'),
          database: configService.get('mysql_database'),
          synchronize: true,
          logging: true,
          entities: [path.join(__dirname, 'user/entities/*.entity.{ts,js}')],
          poolSize: 5,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
        }
      },
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: configService.get('jwt_expires_in'),
          },
        }
      },
    }),
    RedisModule,
    EmailModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
