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
	IsUUID,
	IsOptional
} from 'class-validator'
export class CreateReviewCriteriaDto {
	@IsString()
	title: string
	@IsString()
	description: string
}
