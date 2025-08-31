import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { TagDto } from '@/tag/dto/tag.dto'
export class UpdateArticleDto {
	@IsString()
	title: string
	@IsString()
	description: string
	@IsOptional()
	previewImageUrl: string | null
	@IsString()
	@IsOptional()
	content: string

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TagDto)
	tags?: TagDto[]
}
