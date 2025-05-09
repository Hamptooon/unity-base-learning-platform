import { Type } from 'class-transformer'
import { ReviewScoreDto } from './review-score.dto'
// create-review.dto.ts
import {
	IsUUID,
	IsArray,
	ValidateNested,
	IsString,
	IsOptional,
	IsInt,
	Min,
	Max
} from 'class-validator'
export class CreateReviewDto {
	@IsUUID()
	submissionId: string

	@IsUUID()
	reviewerId: string

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ReviewScoreDto)
	scores: ReviewScoreDto[]

	@IsString()
	@IsOptional()
	comment?: string
}
