import { Get, Param, Post, Body } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { ReviewService } from './review.service'
import {
	ReviewSubmissionDto,
	ReviewSubmissionIndependentDto
} from './dto/review-submission.dto'
import { ReviewComplaintDto } from './dto/review-complaint.dto'
@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	// @Get('unreviewed-practises/:userId')
	// async getUnreviewedPractise(@Param('userId') userId: string) {
	// 	return await this.reviewService.getUnreviewedPractise(userId)
	// }

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

	@Get('unreviewed-practises/:reviewerSubmissionId')
	async getSubmissionsToReviewByPractiseSubmissionId(
		@Param('reviewerSubmissionId') reviewerSubmissionId: string
	) {
		return await this.reviewService.getSubmissionsToReviewByPractiseSubmissionId(
			reviewerSubmissionId
		)
	}

	@Post('submissions/:submissionId')
	async reviewSubmission(
		@Param('submissionId') submissionId: string,
		@Body() reviewData: ReviewSubmissionDto
	) {
		console.log('reviewData', reviewData)
		console.log('submissionId', submissionId)
		return await this.reviewService.reviewSubmission(submissionId, reviewData)
	}

	@Post('submissions/:submissionId/non-reviewer-submition')
	async reviewSubmissionWithoutRevieweSubmission(
		@Param('submissionId') submissionId: string,
		@Body() reviewData: ReviewSubmissionIndependentDto
	) {
		console.log('reviewData', reviewData)
		console.log('submissionId', submissionId)
		return await this.reviewService.reviewSubmissionWithoutReviwerSubmissionId(
			submissionId,
			reviewData
		)
	}
	@Get('criterias/practise/:practiseSubmissionId')
	async getReviewsBySubmissionId(
		@Param('practiseSubmissionId') practiseSubmissionId: string
	) {
		return await this.reviewService.getReviewCriteriasByPractiseSubmissionId(
			practiseSubmissionId
		)
	}
	// @Post('complaint/:reviewId')
	// async complaintReview(
	// 	@Param('reviewId') reviewId: string,
	// 	@Body() data: ReviewComplaintDto
	// ) {
	// 	return await this.reviewService.complaintReview(reviewId, data)
	// }

	@Get('complaint/:reviewId/:reviewerId')
	async getComplaintReview(
		@Param('reviewId') reviewId: string,
		@Param('reviewerId') reviewerId: string
	) {
		return await this.reviewService.getComplaintReview(reviewId, reviewerId)
	}

	@Get('check/:userId/:submissionId')
	async checkReview(
		@Param('userId') userId: string,
		@Param('submissionId') submissionId: string
	) {
		return await this.reviewService.checkReview(userId, submissionId)
	}
}
