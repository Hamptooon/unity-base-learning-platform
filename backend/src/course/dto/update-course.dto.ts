import { Difficulty } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	IsString,
	IsUrl,
	MinLength,
	IsInt,
	Min,
	Max,
	IsEnum,
	IsArray,
	ArrayNotEmpty,
	ValidateNested,
	IsOptional
} from 'class-validator'
import { AddObjectiveDto } from './add-objective.dto'
import { CoursePartDto } from './course-part.dto'
export class UpdateCourseDto {
	@IsString()
	@MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
	title: string

	@IsString()
	@MinLength(10, { message: 'Название должно содержать минимум 10 символа' })
	description: string

	@IsOptional()
	previewImageUrl: string | null

	@IsString()
	@MinLength(5, {
		message: 'Необходимые знания должны содержать минимум 5 символов'
	})
	prerequisites: string

	@IsInt()
	@Min(1, { message: 'Минимальная продолжительность - 1 час' })
	@Max(100, { message: 'Максимальная продолжительность - 100 часов' })
	duration: number

	@IsEnum(Difficulty, {
		message:
			'Сложность должна быть одной из: newbie, beginner, intermediate, advanced'
	})
	difficulty: Difficulty

	@IsArray()
	@ArrayNotEmpty({ message: 'Добавьте хотя бы одну цель обучения' })
	@ValidateNested({ each: true })
	@Type(() => AddObjectiveDto)
	learningObjectives: AddObjectiveDto[]

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CoursePartDto)
	parts: CoursePartDto[]
}
