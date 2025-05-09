// update-review-criteria.dto.ts
import { IsString, IsUUID } from 'class-validator'
import { CreateReviewCriteriaDto } from './create-review-criteria.dto'
export class UpdateReviewCriteriaDto extends CreateReviewCriteriaDto {
	@IsUUID()
	id: string
}
