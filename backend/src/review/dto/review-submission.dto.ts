// review-score.dto.ts
import { Type } from 'class-transformer'
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
export class ReviewSubmissionDto {
	@IsOptional()
	@IsUUID()
	reviewerSubmissionId: string

	@IsString()
	comment: string

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ScoreReviewDto)
	scores: ScoreReviewDto[]
}
export class ReviewSubmissionIndependentDto {
	@IsString()
	comment: string
	@IsUUID()
	reviewerId: string
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ScoreReviewDto)
	scores: ScoreReviewDto[]
}
export class ScoreReviewDto {
	@IsUUID()
	criteriaId: string

	@IsInt()
	@Min(1)
	@Max(5)
	score: number
}
