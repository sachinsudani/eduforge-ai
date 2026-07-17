import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { envValidationSchema } from './config/validation'
import { MongooseModule } from '@nestjs/mongoose'
import { CacheModule } from '@nestjs/cache-manager'
import * as redisStore from 'cache-manager-redis-store'
import { BullModule } from '@nestjs/bull'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ContentModule } from './content/content.module'
import { UploadModule } from './upload/upload.module'
import { RagModule } from './rag/rag.module'
import { AnalyticsModule } from './analytics/analytics.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema: envValidationSchema,
            envFilePath: ['.env']
        }),
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.MONGO_URI,
                dbName: process.env.MONGO_DB
            })
        }),
        CacheModule.register({
            isGlobal: true,
            store: redisStore as any,
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT || 6379)
        }),
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: Number(process.env.REDIS_PORT || 6379)
            }
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
        AuthModule,
        UsersModule,
        ContentModule,
        UploadModule,
        RagModule,
        AnalyticsModule
    ],
    controllers: [AppController],
    providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule { }
