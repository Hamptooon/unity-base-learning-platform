import { PartType } from '@prisma/client'
import {
	IsEnum,
	IsOptional,
	ValidateNested,
	IsInt,
	IsString
} from 'class-validator'
import { Type } from 'class-transformer'
import { CreateCourseArticleDto } from './create-course-article.dto'
import { CreateCoursePractiseDto } from './create-course-practise.dto'
export class CreateCoursePartDto {
	@IsString()
	title: string
	@IsString()
	description: string

	@IsOptional()
	previewImageUrl: string
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateCourseArticleDto)
	article: CreateCourseArticleDto
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateCoursePractiseDto)
	practice: CreateCoursePractiseDto
	@IsEnum(PartType)
	type: PartType

	@IsInt()
	sortOrder: number
}
