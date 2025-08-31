import {
	IsOptional,
	IsString,
	IsArray,
	ValidateNested,
	IsInt,
	Min,
	Max,
	IsEnum
} from 'class-validator'
import { Type } from 'class-transformer'
import { TagDto } from '@/tag/dto/tag.dto'
import { Difficulty } from '@prisma/client'

export class UpdatePractiseDto {
	@IsString()
	title: string
	@IsString()
	description: string
	@IsOptional()
	previewImageUrl: string | null

	@IsOptional()
	assetsFileUrl: string | null
	@IsInt()
	@Min(1, { message: 'Минимальная продолжительность - 1 час' })
	@Max(100, { message: 'Максимальная продолжительность - 100 часов' })
	duration: number

	@IsEnum(Difficulty, {
		message:
			'Сложность должна быть одной из: newbie, beginner, intermediate, advanced'
	})
	difficulty: Difficulty

	@IsString()
	@IsOptional()
	content: string

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TagDto)
	tags?: TagDto[]
}
