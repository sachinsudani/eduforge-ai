import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { IsString, IsOptional, IsNumberString } from 'class-validator'
import { RagService } from './rag.service'

class IngestDto {
    @IsString()
    fileKey!: string

    @IsString()
    @IsOptional()
    videoId?: string
}

class AskQueryDto {
    @IsString()
    q!: string

    @IsNumberString()
    @IsOptional()
    k?: string
}

@Controller('rag')
export class RagController {
    constructor(private readonly rag: RagService) { }

    @Post('ingest')
    async ingest(@Body() body: IngestDto) {
        return this.rag.ingestChunksForFile(body.fileKey, body.videoId)
    }

    @Get('ask')
    async ask(@Query() query: AskQueryDto) {
        const topK = query.k ? Number(query.k) : 5
        return this.rag.answer(query.q, topK)
    }
}
