import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { User, UserSchema } from '../users/schemas/user.schema'
import { SubtitleChunk, SubtitleChunkSchema } from '../upload/schemas/subtitle-chunk.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SubtitleChunk.name, schema: SubtitleChunkSchema }
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
