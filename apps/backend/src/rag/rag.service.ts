import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubtitleChunk, SubtitleChunkDocument } from '../upload/schemas/subtitle-chunk.schema'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

@Injectable()
export class RagService {
    private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    private readonly pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' })

    constructor(
        @InjectModel(SubtitleChunk.name) private readonly chunkModel: Model<SubtitleChunkDocument>
    ) { }

    private get index() {
        const name = process.env.PINECONE_INDEX
        if (!name) throw new Error('PINECONE_INDEX not set')
        return this.pinecone.Index(name)
    }

    async embedText(text: string): Promise<number[]> {
        const res = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            dimensions: 1024
        })
        return res.data[0].embedding as unknown as number[]
    }

    async ingestChunksForFile(fileKey: string, videoId?: string) {
        const chunks = await this.chunkModel.find({ fileKey }).lean()
        if (chunks.length === 0) return { upserted: 0 }

        const vectors = [] as Array<{ id: string; values: number[]; metadata: Record<string, any> }>

        for (const c of chunks) {
            const emb = await this.embedText(c.text)
            vectors.push({
                id: String(c._id),
                values: emb,
                metadata: {
                    fileKey: c.fileKey,
                    videoId: videoId || c.contentId?.toString() || undefined,
                    startMs: c.startMs,
                    endMs: c.endMs,
                    text: c.text
                }
            })
        }

        await this.index.upsert(vectors)
        return { upserted: vectors.length }
    }

    async semanticSearch(query: string, topK = 5) {
        const qvec = await this.embedText(query)
        const res = await this.index.query({
            topK,
            vector: qvec,

            includeMetadata: true
        })

        return res.matches?.map((m) => ({
            id: m.id,
            score: m.score || 0,
            text: (m.metadata as any)?.text,
            startMs: (m.metadata as any)?.startMs,
            endMs: (m.metadata as any)?.endMs,
            videoId: (m.metadata as any)?.videoId,
            fileKey: (m.metadata as any)?.fileKey
        })) || []
    }

    async answer(query: string, topK = 5) {
        const matches = await this.semanticSearch(query, topK)

        const context = matches
            .map((m, i) => `[#${i + 1}] (${m.videoId || m.fileKey} @ ${Math.floor((m.startMs || 0) / 1000)}s-${Math.floor((m.endMs || 0) / 1000)}s)\n${m.text}`)
            .join('\n\n')

        const prompt = `You are a helpful tutor. Answer the user's question using only the context. Cite sources as [#n] with approximate timestamps.\n\nContext:\n${context}\n\nQuestion: ${query}`

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful AI tutor.' },
                { role: 'user', content: prompt }
            ]
        })

        const answer = completion.choices[0]?.message?.content || ''
        return { answer, sources: matches }
    }
}
