// create-course.dto.ts
import { Difficulty } from '@prisma/client'
import { AddObjectiveDto } from './add-objective.dto'
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
	MaxLength,
	IsOptional
} from 'class-validator'
export class CreateCourseMainInfoDto {
	@IsString()
	@MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
	@MaxLength(40, { message: 'Название должно содержать максимум 40 символов' })
	title: string

	@IsString()
	@MinLength(10, { message: 'Название должно содержать минимум 10 символа' })
	@MaxLength(200, {
		message: 'Название должно содержать максимум 200 символов'
	})
	description: string

	@IsOptional()
	previewImageUrl: string
}
