import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { RagService } from './rag.service'

@Controller('rag')
export class RagController {
    constructor(private readonly rag: RagService) { }

    @Post('ingest')
    async ingest(@Body() body: { fileKey: string; videoId?: string }) {
        return this.rag.ingestChunksForFile(body.fileKey, body.videoId)
    }

    @Get('ask')
    async ask(@Query('q') q: string, @Query('k') k?: string) {
        const topK = k ? Number(k) : 5
        return this.rag.answer(q, topK)
    }
}
