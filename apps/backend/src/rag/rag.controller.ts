import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Type } from 'class-transformer'
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator'
import type { Response } from 'express'
import { Role } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/role.enum'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { RagService } from './rag.service'

class IngestDto {
    @IsString()
    fileKey!: string

    @IsString()
    @IsOptional()
    videoId?: string
}

class HistoryMessageDto {
    @IsIn(['user', 'assistant'])
    role!: 'user' | 'assistant'

    @IsString()
    @MaxLength(4000)
    content!: string
}

class AskStreamDto {
    @IsString()
    @MaxLength(500)
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

    // Streams newline-delimited JSON events: {type:'sources'} → {type:'delta'}* → {type:'done'}
    @Post('ask/stream')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 15, ttl: 60_000 } })
    async askStream(@Body() body: AskStreamDto, @Req() req: any, @Res() res: Response) {
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('X-Accel-Buffering', 'no')
        try {
            await this.rag.answerStream(body.q, body.k ?? 5, body.history ?? [], (event) => {
                res.write(JSON.stringify(event) + '\n')
            }, req.user?.userId)
        } catch (err) {
            res.write(JSON.stringify({ type: 'error', message: 'Failed to generate an answer' }) + '\n')
        }
        res.end()
    }
}
