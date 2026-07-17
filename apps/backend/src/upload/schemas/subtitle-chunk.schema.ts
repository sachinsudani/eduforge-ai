import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type SubtitleChunkDocument = HydratedDocument<SubtitleChunk>

@Schema({ timestamps: true, collection: 'subtitle_chunks', versionKey: false })
export class SubtitleChunk {
    @Prop({ required: true })
    fileKey!: string

    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    ownerId!: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'Content', index: true, required: false })
    contentId?: Types.ObjectId

    @Prop({ required: true })
    text!: string

    @Prop({ required: true })
    startMs!: number

    @Prop({ required: true })
    endMs!: number
}

export const SubtitleChunkSchema = SchemaFactory.createForClass(SubtitleChunk)
