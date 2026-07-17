import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common'
import { IsArray, IsIn, IsInt, IsString, IsOptional, IsNumberString, Max, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import type { Response } from 'express'
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

class HistoryMessageDto {
    @IsIn(['user', 'assistant'])
    role!: 'user' | 'assistant'

    @IsString()
    content!: string
}

class AskStreamDto {
    @IsString()
    q!: string

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    k?: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HistoryMessageDto)
    @IsOptional()
    history?: HistoryMessageDto[]
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

    // Streams newline-delimited JSON events: {type:'sources'} → {type:'delta'}* → {type:'done'}
    @Post('ask/stream')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async askStream(@Body() body: AskStreamDto, @Res() res: Response) {
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('X-Accel-Buffering', 'no')
        try {
            await this.rag.answerStream(body.q, body.k ?? 5, body.history ?? [], (event) => {
                res.write(JSON.stringify(event) + '\n')
            })
        } catch (err) {
            res.write(JSON.stringify({ type: 'error', message: 'Failed to generate an answer' }) + '\n')
        }
        res.end()
    }
}
