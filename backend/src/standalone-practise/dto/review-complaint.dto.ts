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
	Max,
	IsEnum
} from 'class-validator'
import { ComplaintReviewType } from '@prisma/client'
export class ReviewComplaintDto {
	@IsUUID()
	reviewerUserId: string

	@IsString()
	comment: string
	@IsEnum(ComplaintReviewType, {
		message: 'Сложность должна быть одной из: abuse, incorrectrate'
	})
	complaintReviewType: ComplaintReviewType
}
