import { Controller, Post, Get, Delete, UploadedFile, UseGuards, UseInterceptors, Req, BadRequestException, Param, Query } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import type { Express } from 'express'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
    constructor(
        @InjectQueue('upload-processing') private readonly queue: Queue,
        private readonly uploadService: UploadService
    ) { }

    @Post('subtitles')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadSubtitles(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) throw new BadRequestException('file is required')
        const mime = file.mimetype || ''
        const name = file.originalname || 'upload.txt'
        if (!/srt|vtt/i.test(mime) && !/\.(srt|vtt)$/i.test(name)) {
            throw new BadRequestException('Only SRT or VTT files are allowed')
        }
        const fileKey = `${Date.now()}-${name}`
        await this.queue.add('parse-subtitles', {
            fileKey,
            ownerId: req.user.userId,
            mimeType: mime,
            bufferBase64: file.buffer.toString('base64')
        }, {
            removeOnComplete: { age: 24 * 3600, count: 100 },
            removeOnFail: { age: 7 * 24 * 3600 }
        })
        return { queued: true, fileKey }
    }

    @Get('chunks')
    @UseGuards(JwtAuthGuard)
    async getSubtitleChunks(@Query('fileKey') fileKey?: string) {
        return this.uploadService.getChunks(fileKey)
    }

    @Delete('chunks/:fileKey')
    @UseGuards(JwtAuthGuard)
    async deleteSubtitleChunks(@Param('fileKey') fileKey: string) {
        await this.uploadService.deleteChunks(fileKey)
        return { message: 'Chunks deleted successfully' }
    }

    @Get('jobs')
    @UseGuards(JwtAuthGuard)
    async getJobs() {
        return this.uploadService.getJobs()
    }

    @Get('jobs/:jobId')
    @UseGuards(JwtAuthGuard)
    async getJobStatus(@Param('jobId') jobId: string) {
        return this.uploadService.getJobStatus(jobId)
    }
}
