import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SubtitleChunk, SubtitleChunkSchema } from '../upload/schemas/subtitle-chunk.schema'
import { RagController } from './rag.controller'
import { RagService } from './rag.service'
import { QueryLog, QueryLogSchema } from './schemas/query-log.schema'

@Module({
    imports: [MongooseModule.forFeature([
        { name: SubtitleChunk.name, schema: SubtitleChunkSchema },
        { name: QueryLog.name, schema: QueryLogSchema }
    ])],
    controllers: [RagController],
    providers: [RagService],
    exports: [RagService]
})
export class RagModule { }
