import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateContentDto {
	@IsString()
	@IsOptional()
	@MinLength(3)
	title?: string

	@IsString()
	@IsOptional()
	description?: string

	@IsArray()
	@IsOptional()
	tags?: string[]

	@IsBoolean()
	@IsOptional()
	isPublished?: boolean
}
