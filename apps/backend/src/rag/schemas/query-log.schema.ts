import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type QueryLogDocument = HydratedDocument<QueryLog>

@Schema({ timestamps: true, collection: 'query_logs', versionKey: false })
export class QueryLog {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', index: true })
    userId?: Types.ObjectId

    @Prop({ required: true })
    query!: string

    @Prop()
    topScore?: number

    @Prop({ required: true })
    matchCount!: number

    // false = no source passed the relevance threshold (greeting/off-topic)
    @Prop({ required: true })
    grounded!: boolean

    @Prop({ required: true })
    latencyMs!: number
}

export const QueryLogSchema = SchemaFactory.createForClass(QueryLog)
