import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, Req, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import type { Express } from 'express'

@Controller('upload')
export class UploadController {
    constructor(@InjectQueue('upload-processing') private readonly queue: Queue) { }

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
        })
        return { queued: true, fileKey }
    }
}
