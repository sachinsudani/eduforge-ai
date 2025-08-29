import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RagController } from './rag.controller'
import { RagService } from './rag.service'
import { SubtitleChunk, SubtitleChunkSchema } from '../upload/schemas/subtitle-chunk.schema'

@Module({
    imports: [MongooseModule.forFeature([{ name: SubtitleChunk.name, schema: SubtitleChunkSchema }])],
    controllers: [RagController],
    providers: [RagService]
})
export class RagModule { }
