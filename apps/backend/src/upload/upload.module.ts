import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { MongooseModule } from '@nestjs/mongoose'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { UploadProcessor } from './upload.processor'
import { SubtitleChunk, SubtitleChunkSchema } from './schemas/subtitle-chunk.schema'

@Module({
    imports: [
        BullModule.registerQueue({ name: 'upload-processing' }),
        MongooseModule.forFeature([{ name: SubtitleChunk.name, schema: SubtitleChunkSchema }])
    ],
    controllers: [UploadController],
    providers: [UploadService, UploadProcessor]
})
export class UploadModule { }
