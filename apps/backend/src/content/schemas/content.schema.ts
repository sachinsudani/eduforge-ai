import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type ContentDocument = HydratedDocument<Content>

@Schema({ timestamps: true, versionKey: false })
export class Content {
	@Prop({ required: true })
	title!: string

	@Prop()
	description?: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User', index: true })
	ownerId!: Types.ObjectId

	@Prop({ type: [String], default: [] })
	tags?: string[]

	@Prop({ default: true })
	isPublished?: boolean
}

export const ContentSchema = SchemaFactory.createForClass(Content)
