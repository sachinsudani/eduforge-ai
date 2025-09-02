import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubtitleChunk, SubtitleChunkDocument } from './schemas/subtitle-chunk.schema'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Injectable()
export class UploadService {
    constructor(
        @InjectModel(SubtitleChunk.name) private readonly chunkModel: Model<SubtitleChunkDocument>,
        @InjectQueue('upload-processing') private readonly queue: Queue
    ) { }

    async getChunks(fileKey?: string) {
        if (fileKey) {
            return this.chunkModel.find({ fileKey }).lean()
        }
        return this.chunkModel.find().lean()
    }

    async deleteChunks(fileKey: string) {
        return this.chunkModel.deleteMany({ fileKey })
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
