import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { IsString, IsOptional, IsNumberString } from 'class-validator'
import { RagService } from './rag.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role(UserRole.Instructor, UserRole.Admin)
    async ingest(@Body() body: IngestDto) {
        return this.rag.ingestChunksForFile(body.fileKey, body.videoId)
    }

    @Get('ask')
    @UseGuards(JwtAuthGuard)
    async ask(@Query() query: AskQueryDto) {
        const topK = query.k ? Number(query.k) : 5
        return this.rag.answer(query.q, topK)
    }
}
