import { Injectable, Logger } from '@nestjs/common'
import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { SubtitleChunk, SubtitleChunkDocument } from './schemas/subtitle-chunk.schema'
import { parseSrt } from './parsers/srt.parser'
import { parseVtt } from './parsers/vtt.parser'

export type UploadJobData = {
    fileKey: string
    ownerId: string
    contentId?: string
    mimeType: string
    bufferBase64: string
}

@Injectable()
@Processor('upload-processing')
export class UploadProcessor {
    private readonly logger = new Logger(UploadProcessor.name)
    constructor(
        @InjectModel(SubtitleChunk.name)
        private readonly chunkModel: Model<SubtitleChunkDocument>
    ) { }

    @Process('parse-subtitles')
    async handleParse(job: Job<UploadJobData>) {
        const { fileKey, ownerId, contentId, mimeType, bufferBase64 } = job.data
        const buffer = Buffer.from(bufferBase64, 'base64')
        const text = buffer.toString('utf-8')
        let chunks
        if (mimeType.includes('vtt') || fileKey.toLowerCase().endsWith('.vtt')) {
            chunks = parseVtt(text)
        } else {
            chunks = parseSrt(text)
        }
        if (!chunks || chunks.length === 0) return { inserted: 0 }
        const docs = chunks.map((c) => ({
            fileKey,
            ownerId: new Types.ObjectId(ownerId),
            contentId: contentId ? new Types.ObjectId(contentId) : undefined,
            text: c.text,
            startMs: c.startMs,
            endMs: c.endMs
        }))
        await this.chunkModel.insertMany(docs)
        this.logger.log(`Stored ${docs.length} subtitle chunks for ${fileKey}`)
        return { inserted: docs.length }
    }
}
