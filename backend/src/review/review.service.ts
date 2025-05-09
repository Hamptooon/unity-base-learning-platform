import {
	Injectable,
	NotFoundException,
	ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReviewService {
	constructor(private prisma: PrismaService) {}

	async getUnreviewedPractise(userId: string) {
		const unreviewedPractise = await this.prisma.practiceSubmission.findMany({
			where: {
				userId: {
					not: userId
				},
				isReviewed: false,
				canReviewed: true
			}
		})

		if (!unreviewedPractise) {
			throw new NotFoundException('No unreviewed practise found')
		}

		return unreviewedPractise
	}

	async setTargetReviews(userId: string, practiseSubmitionId: string) {
		const unreviewedPractises = await this.prisma.practiceSubmission.findMany({
			where: {
				userId: {
					not: userId
				},
				isReviewed: false
			}
		})
		let resultTargetReviews: string[] = []
		if (!unreviewedPractises) {
			resultTargetReviews = []
		}
		if (unreviewedPractises.length == 1) {
			resultTargetReviews = [unreviewedPractises[0].id]
		} else if (unreviewedPractises.length > 1) {
			const targetReview1Index = Math.floor(
				Math.random() * unreviewedPractises.length
			)
			let targetReview2Index: number = Math.floor(
				Math.random() * unreviewedPractises.length
			)
			while (targetReview1Index === targetReview2Index) {
				targetReview2Index = Math.floor(
					Math.random() * unreviewedPractises.length
				)
			}
			const targetReview1 = unreviewedPractises[targetReview1Index]

			const targetReview2 = unreviewedPractises[targetReview2Index]
			resultTargetReviews = [targetReview1.id, targetReview2.id]
		}

		await this.prisma.practiceSubmission.update({
			where: {
				id: practiseSubmitionId
			},
			data: {
				reviewsTargets: resultTargetReviews
			}
		})
		return resultTargetReviews
	}

	async getSubmissoionById(submissionId: string) {
		const submission = await this.prisma.practiceSubmission.findUnique({
			where: { id: submissionId },
			include: {
				user: true
			}
		})
		if (!submission) {
			throw new NotFoundException('Submission not found')
		}
		return submission
	}

	async getUserSubmissoionByPartId(userId: string, partId: string) {
		const submission = await this.prisma.practiceSubmission.findFirst({
			where: {
				userId: userId,
				partId: partId
			}
		})
		if (!submission) {
			throw new NotFoundException('Submission not found')
		}
		return submission
	}

	async getReviewCriterias(practiseId: string) {
		const criterias = await this.prisma.reviewPractiseCriteria.findMany({
			where: { coursePractiseId: practiseId }
		})
		if (!criterias) {
			throw new NotFoundException('No review criterias found')
		}
		return criterias
	}
	async getReviewCriteriasByPartId(partId: string) {
		const part = await this.prisma.coursePart.findUnique({
			where: { id: partId }
		})
		if (!part) {
			throw new NotFoundException('Part not found')
		}
		if (!part.coursePracticeTaskId) {
			throw new ConflictException('Part does not have a practice task')
		}

		const criterias = await this.prisma.reviewPractiseCriteria.findMany({
			where: { coursePractiseId: part.coursePracticeTaskId }
		})
		if (!criterias) {
			throw new NotFoundException('No review criterias found')
		}
		return criterias
	}
}
