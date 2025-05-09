import { Get, Param } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { ReviewService } from './review.service'

@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Get('unreviewed-practises/:userId')
	async getUnreviewedPractise(@Param('userId') userId: string) {
		return await this.reviewService.getUnreviewedPractise(userId)
	}

	@Get('set-target-reviews/:userId/:practiseSubmitionId')
	async setTargetReviews(
		@Param('userId') userId: string,
		@Param('practiseSubmitionId') practiseSubmitionId: string
	) {
		return await this.reviewService.setTargetReviews(
			userId,
			practiseSubmitionId
		)
	}

	@Get('submissions/:submissionId')
	async getSubmissoionById(@Param('submissionId') submissionId: string) {
		return await this.reviewService.getSubmissoionById(submissionId)
	}
	@Get('submissions/:userId/:partId')
	async getUserSubmissoionByPartId(
		@Param('userId') userId: string,
		@Param('partId') partId: string
	) {
		return await this.reviewService.getUserSubmissoionByPartId(userId, partId)
	}
	@Get('criterias/:practiseId')
	async getReviewCriterias(@Param('practiseId') practiseId: string) {
		return await this.reviewService.getReviewCriterias(practiseId)
	}
	@Get('criterias/parts/:partId')
	async getReviewCriteriasByPartId(@Param('partId') partId: string) {
		return await this.reviewService.getReviewCriteriasByPartId(partId)
	}
}
