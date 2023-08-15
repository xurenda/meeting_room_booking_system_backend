import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { createClient } from 'redis'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        const redis = createClient({
          socket: {
            host: configService.get('redis_host'),
            port: configService.get('redis_port'),
          },
          database: configService.get('redis_database'),
        })
        await redis.connect()
        return redis
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
