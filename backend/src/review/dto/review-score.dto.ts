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
export class ReviewScoreDto {
	@IsUUID()
	criteriaId: string

	@IsInt()
	@Min(1)
	@Max(5)
	value: number
}
