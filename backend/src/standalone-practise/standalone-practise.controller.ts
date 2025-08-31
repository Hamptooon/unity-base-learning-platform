import { Get, Param, Post, Body, Put, Delete, Query } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { PractiseService } from './standalone-practise.service'
import { CreatePractiseDto } from './dto/create-practise.dto'
import { CreatePractiseCriteriaDto } from './dto/create-practise-criteria.dto'
import { UpdatePractiseDto } from './dto/update-practise.dto'
import { CreatePractiseSubmissionDto } from './dto/create-practise-submission.dto'
import { ReviewSubmissionDto } from './dto/review-submission.dto'
import { ReviewComplaintDto } from './dto/review-complaint.dto'
@Controller('practises')
export class PractiseController {
	constructor(private readonly practiseService: PractiseService) {}
	@Get()
	async getPractises(
		@Query()
		filters: {
			page?: number
			limit?: number
			status?: 'published' | 'draft'
			search?: string
			tags?: string // <--- добавили
			sortOrder?: 'asc' | 'desc'
		}
	) {
		return await this.practiseService.getPractises({
			page: Number(filters.page) || 1,
			limit: Number(filters.limit) || 10,
			...filters
		})
	}

	@Get(':id')
	async getPractiseById(@Param('id') id: string) {
		return await this.practiseService.getPractiseById(id)
	}

	@Post()
	async createPractise(@Body() practiseData: CreatePractiseDto) {
		return await this.practiseService.createPractise(practiseData)
	}

	@Put(`:id`)
	async updatePractise(
		@Param('id') id: string,
		@Body() practiseData: UpdatePractiseDto
	) {
		return await this.practiseService.updatePractise(id, practiseData)
	}

	@Delete(':id/criterias/:criteriaId')
	async deleteCriteria(
		@Param('id') id: string,
		@Param('criteriaId') criteriaId: string
	) {
		return await this.practiseService.deleteCriteria(id, criteriaId)
	}
	@Delete(':id')
	async deleteArticle(@Param('id') id: string) {
		return await this.practiseService.deletePractise(id)
	}

	@Post(':id/criterias')
	async createCriteria(
		@Param('id') id: string,
		@Body() criteriaData: CreatePractiseCriteriaDto
	) {
		return await this.practiseService.createCriteria(id, criteriaData)
	}

	@Put(':id/criterias/:criteriaId')
	async updateCriteria(
		@Param('id') id: string,
		@Param('criteriaId') criteriaId: string,
		@Body() criteriaData: CreatePractiseCriteriaDto
	) {
		return await this.practiseService.updateCriteria(
			id,
			criteriaId,
			criteriaData
		)
	}

	@Post(':id/submissions')
	async submitPractise(
		@Param('id') id: string,
		@Body() data: CreatePractiseSubmissionDto
	) {
		return this.practiseService.createPractiseSubmission(id, data)
	}

	@Get(':id/submission/:userId')
	async getPractiseSubmission(
		@Param('id') id: string,
		@Param('userId') userId: string
	) {
		return this.practiseService.getPractiseSubmission(id, userId)
	}

	@Get(':id/submissions/:reviewerSubmissionId')
	async getSubmissionsToReview(
		@Param('id') id: string,
		@Param('userId') reviewerSubmissionId: string
	) {
		return this.practiseService.getSubmissionsToReview(id, reviewerSubmissionId)
	}

	@Post('reviews/submissions/:submissionId')
	async reviewSubmission(
		@Param('submissionId') submissionId: string,
		@Body() reviewData: ReviewSubmissionDto
	) {
		console.log('reviewData', reviewData)
		console.log('submissionId', submissionId)
		return await this.practiseService.reviewSubmission(submissionId, reviewData)
	}
	@Get('reviews/submissionss/:submissionId')
	async getReviewsBySolutionId(@Param('submissionId') submissionId: string) {
		console.log('Controller HIT with submissionId:', submissionId)
		return await this.practiseService.getReviewsBySolutionId(submissionId)
	}
	@Post('reviews/complaint/:reviewId')
	async complaintReview(
		@Param('reviewId') reviewId: string,
		@Body() data: ReviewComplaintDto
	) {
		return await this.practiseService.complaintReview(reviewId, data)
	}

	@Get('reviews/complaint/:reviewId/:reviewerId')
	async getComplaintReview(
		@Param('reviewId') reviewId: string,
		@Param('reviewerId') reviewerId: string
	) {
		return await this.practiseService.getComplaintReview(reviewId, reviewerId)
	}

	@Get(':practiseId/publish')
	async publishArticle(@Param('practiseId') practiseId: string) {
		return this.practiseService.publishPractise(practiseId)
	}

	@Get(':practiseId/hide')
	async hideArticle(@Param('practiseId') practiseId: string) {
		return this.practiseService.hidePractise(practiseId)
	}
}
