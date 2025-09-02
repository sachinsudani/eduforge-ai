import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/schemas/user.schema'
import { SubtitleChunk, SubtitleChunkDocument } from '../upload/schemas/subtitle-chunk.schema'

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(SubtitleChunk.name) private readonly chunkModel: Model<SubtitleChunkDocument>
    ) { }

    async getAnalytics() {
        const [totalUsers, totalFiles, totalChunks] = await Promise.all([
            this.userModel.countDocuments(),
            this.chunkModel.distinct('fileKey').countDocuments(),
            this.chunkModel.countDocuments()
        ])

        // Mock data for now - in production this would come from actual query logs
        const popularQueries = [
            { query: 'What is the main concept?', count: 15 },
            { query: 'Can you explain this topic?', count: 12 },
            { query: 'How does this work?', count: 8 },
            { query: 'What are the key points?', count: 6 },
            { query: 'Can you give an example?', count: 5 }
        ]

        const recentActivity = [
            {
                type: 'file_upload',
                description: 'New subtitle file uploaded',
                timestamp: new Date()
            },
            {
                type: 'user_registration',
                description: 'New user registered',
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                type: 'query_processed',
                description: 'Student question answered',
                timestamp: new Date(Date.now() - 7200000)
            }
        ]

        return {
            totalUsers,
            totalFiles,
            totalQueries: 156, // Mock data
            popularQueries,
            recentActivity
        }
    }
}
