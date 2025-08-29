import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Content, ContentDocument } from './schemas/content.schema'
import { CreateContentDto } from './dto/create-content.dto'
import { UpdateContentDto } from './dto/update-content.dto'

@Injectable()
export class ContentService {
	constructor(@InjectModel(Content.name) private readonly contentModel: Model<ContentDocument>) {}

	async create(ownerId: string, dto: CreateContentDto) {
		return this.contentModel.create({ ...dto, ownerId: new Types.ObjectId(ownerId) })
	}

	async findMine(ownerId: string) {
		return this.contentModel.find({ ownerId }).lean()
	}

	async findPublished() {
		return this.contentModel.find({ isPublished: true }).lean()
	}

	async update(ownerId: string, id: string, dto: UpdateContentDto) {
		const doc = await this.contentModel.findById(id)
		if (!doc) throw new NotFoundException('Content not found')
		if (String(doc.ownerId) !== String(ownerId)) throw new ForbiddenException('Not owner')
		Object.assign(doc, dto)
		await doc.save()
		return doc.toObject()
	}

	async remove(ownerId: string, id: string) {
		const doc = await this.contentModel.findById(id)
		if (!doc) throw new NotFoundException('Content not found')
		if (String(doc.ownerId) !== String(ownerId)) throw new ForbiddenException('Not owner')
		await doc.deleteOne()
		return { ok: true }
	}
}
