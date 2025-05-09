import { PartType } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
	ValidateNested,
	IsInt,
	IsUUID,
	IsString
} from 'class-validator'
import { Type } from 'class-transformer'
import { CourseArticleDto } from './course-article.dto'
import { CoursePractiseDto } from './course-practise.dto'
export class CoursePartDto {
	@IsUUID()
	id: string
	@IsString()
	title: string
	@IsString()
	description: string
	@IsOptional()
	@ValidateNested()
	@Type(() => CourseArticleDto)
	article: CourseArticleDto | null
	@IsOptional()
	previewImageUrl: string | null
	@IsOptional()
	@ValidateNested()
	@Type(() => CoursePractiseDto)
	practice: CoursePractiseDto | null
	@IsEnum(PartType)
	type: PartType

	@IsInt()
	sortOrder: number
}
