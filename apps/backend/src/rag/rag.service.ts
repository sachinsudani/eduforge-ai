import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubtitleChunk, SubtitleChunkDocument } from '../upload/schemas/subtitle-chunk.schema'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

const EMBEDDING_DIMENSIONS = 1024
const WINDOW_MAX_CHARS = 800
const WINDOW_MAX_DURATION_MS = 45_000
const EMBED_BATCH_SIZE = 100

type CueWindow = {
    id: string
    text: string
    startMs: number
    endMs: number
}

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name)
    private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    private readonly pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' })

    constructor(
        @InjectModel(SubtitleChunk.name) private readonly chunkModel: Model<SubtitleChunkDocument>
    ) { }

    get isConfigured(): boolean {
        return Boolean(process.env.OPENAI_API_KEY && process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX)
    }

    private get index() {
        const name = process.env.PINECONE_INDEX
        if (!name) throw new Error('PINECONE_INDEX not set')
        return this.pinecone.Index(name)
    }

    async embedTexts(texts: string[]): Promise<number[][]> {
        const embeddings: number[][] = []
        for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
            const batch = texts.slice(i, i + EMBED_BATCH_SIZE)
            const res = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: batch,
                dimensions: EMBEDDING_DIMENSIONS
            })
            for (const item of res.data) embeddings.push(item.embedding as unknown as number[])
        }
        return embeddings
    }

    async embedText(text: string): Promise<number[]> {
        const [embedding] = await this.embedTexts([text])
        return embedding
    }

    // Merge consecutive cues into larger windows: single cues (a few words each)
    // carry too little semantic signal to retrieve well. Windows overlap by one
    // cue so answers spanning a boundary are still findable. Each window's
    // vector id is the Mongo _id of its first cue, so deleting all of a file's
    // chunk ids from Pinecone always removes every window vector too.
    private buildWindows(chunks: Array<{ _id: any; text: string; startMs: number; endMs: number }>): CueWindow[] {
        const windows: CueWindow[] = []
        let current: { ids: string[]; texts: string[]; startMs: number; endMs: number } | null = null

        for (let i = 0; i < chunks.length; i++) {
            const c = chunks[i]
            if (!current) {
                current = { ids: [String(c._id)], texts: [c.text], startMs: c.startMs, endMs: c.endMs }
                continue
            }
            current.texts.push(c.text)
            current.ids.push(String(c._id))
            current.endMs = c.endMs

            const joined = current.texts.join(' ')
            const duration = current.endMs - current.startMs
            if (joined.length >= WINDOW_MAX_CHARS || duration >= WINDOW_MAX_DURATION_MS) {
                windows.push({ id: current.ids[0], text: joined, startMs: current.startMs, endMs: current.endMs })
                current = { ids: [String(c._id)], texts: [c.text], startMs: c.startMs, endMs: c.endMs }
            }
        }
        if (current && current.ids.length > 0) {
            const isOverlapOnly = windows.length > 0 && current.ids.length === 1
            if (!isOverlapOnly) {
                windows.push({
                    id: current.ids[0],
                    text: current.texts.join(' '),
                    startMs: current.startMs,
                    endMs: current.endMs
                })
            }
        }
        return windows
    }

    async ingestChunksForFile(fileKey: string, videoId?: string) {
        const chunks = await this.chunkModel.find({ fileKey }).sort({ startMs: 1 }).lean()
        if (chunks.length === 0) return { upserted: 0 }

        // Re-ingest is idempotent: clear any previous vectors for this file first
        await this.deleteVectorsByIds(chunks.map((c) => String(c._id)))

        const windows = this.buildWindows(chunks)
        const embeddings = await this.embedTexts(windows.map((w) => w.text))

        const vectors = windows.map((w, i) => ({
            id: w.id,
            values: embeddings[i],
            metadata: {
                fileKey,
                ...(videoId || chunks[0].contentId ? { videoId: videoId || chunks[0].contentId?.toString() } : {}),
                startMs: w.startMs,
                endMs: w.endMs,
                text: w.text
            }
        }))

        for (let i = 0; i < vectors.length; i += EMBED_BATCH_SIZE) {
            await this.index.upsert(vectors.slice(i, i + EMBED_BATCH_SIZE))
        }
        this.logger.log(`Ingested ${vectors.length} windows (${chunks.length} cues) for ${fileKey}`)
        return { upserted: vectors.length }
    }

    async deleteVectorsByIds(ids: string[]) {
        if (!this.isConfigured || ids.length === 0) return
        for (let i = 0; i < ids.length; i += 500) {
            await this.index.deleteMany(ids.slice(i, i + 500))
        }
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
