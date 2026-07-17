import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubtitleChunk, SubtitleChunkDocument } from './schemas/subtitle-chunk.schema'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { RagService } from '../rag/rag.service'
import { UserRole } from '../common/enums/role.enum'

type RequestUser = { userId: string; role: string }

@Injectable()
export class UploadService {
    constructor(
        @InjectModel(SubtitleChunk.name) private readonly chunkModel: Model<SubtitleChunkDocument>,
        @InjectQueue('upload-processing') private readonly queue: Queue,
        private readonly ragService: RagService
    ) { }

    async getChunks(user: RequestUser, fileKey?: string) {
        const filter: Record<string, any> = {}
        if (user.role !== UserRole.Admin) filter.ownerId = user.userId
        if (fileKey) filter.fileKey = fileKey
        return this.chunkModel.find(filter).lean()
    }

    async deleteChunks(user: RequestUser, fileKey: string) {
        const filter: Record<string, any> = { fileKey }
        if (user.role !== UserRole.Admin) filter.ownerId = user.userId
        const chunks = await this.chunkModel.find(filter).select('_id').lean()
        if (chunks.length === 0) throw new NotFoundException('No chunks found for this fileKey')
        const ids = chunks.map((c) => String(c._id))
        await this.ragService.deleteVectorsByIds(ids)
        return this.chunkModel.deleteMany({ _id: { $in: ids } })
    }

    async getJobs() {
        const jobs = await this.queue.getJobs(['waiting', 'active', 'completed', 'failed'])
        return jobs.map(job => ({
            id: job.id,
            fileKey: job.data.fileKey,
            status: job.finishedOn ? 'completed' : job.failedReason ? 'failed' : job.processedOn ? 'active' : 'waiting',
            progress: job.progress(),
            error: job.failedReason,
            createdAt: new Date(job.timestamp),
            updatedAt: new Date(job.processedOn || job.timestamp)
        }))
    }

    async getJobStatus(jobId: string) {
        const job = await this.queue.getJob(jobId)
        if (!job) {
            throw new Error('Job not found')
        }
        return {
            id: job.id,
            fileKey: job.data.fileKey,
            status: job.finishedOn ? 'completed' : job.failedReason ? 'failed' : job.processedOn ? 'active' : 'waiting',
            progress: job.progress(),
            error: job.failedReason,
            createdAt: new Date(job.timestamp),
            updatedAt: new Date(job.processedOn || job.timestamp)
        }
    }
}
