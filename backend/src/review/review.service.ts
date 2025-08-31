import {
	Injectable,
	NotFoundException,
	ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
	ReviewSubmissionDto,
	ReviewSubmissionIndependentDto
} from './dto/review-submission.dto'

import { EmailService } from '../email/email.service'

@Injectable()
export class ReviewService {
	constructor(
		private prisma: PrismaService,
		private emailService: EmailService
	) {}

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

		// await this.prisma.practiceSubmission.update({
		// 	where: {
		// 		id: practiseSubmitionId
		// 	},
		// 	data: {
		// 		reviewsTargets: resultTargetReviews
		// 	}
		// })
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

	async getSubmissionsToReviewByPractiseSubmissionId(
		reviewerSubmissionId: string
	) {
		const reviewsByReviewerSubmissionId =
			await this.prisma.reviewPractise.findMany({
				where: {
					reviewerSubmissionId: reviewerSubmissionId,
					isCompleted: false
				}
			})

		if (!reviewsByReviewerSubmissionId) {
			throw new NotFoundException('No reviews found')
		}
		const submissionsToReview = this.prisma.practiceSubmission.findMany({
			where: {
				id: {
					in: reviewsByReviewerSubmissionId.map(
						review => review.practiceSubmissionId
					)
				}
			}
		})
		return submissionsToReview
	}

	async reviewSubmission(
		submissionId: string,
		reviewData: ReviewSubmissionDto
	) {
		const reviewsByReviewerSubmissionId =
			await this.prisma.reviewPractise.findMany({
				where: {
					reviewerSubmissionId: reviewData.reviewerSubmissionId,
					isCompleted: false
				}
			})
		const review = reviewsByReviewerSubmissionId.find(
			review => review.practiceSubmissionId === submissionId
		)
		if (!review) {
			throw new NotFoundException('Review not found')
		}
		if (review.isCompleted) {
			throw new ConflictException('Review already completed')
		}

		await this.prisma.reviewPractiseScoreCriteria.createMany({
			data: reviewData.scores.map(score => {
				return {
					reviewPractiseId: review.id,
					reviewCriteriaId: score.criteriaId,
					score: score.score
				}
			})
		})
		const scores = reviewData.scores
		const total = scores.reduce((acc, score) => acc + score.score, 0)
		const average = scores.length > 0 ? total / scores.length : 0

		await this.prisma.reviewPractise.update({
			where: { id: review.id },
			data: {
				comment: reviewData.comment,
				score: average,
				isCompleted: true
			}
		})

		const submission = await this.prisma.practiceSubmission.findUnique({
			where: { id: submissionId }
		})

		const reviewsSubmission = await this.prisma.reviewPractise.findMany({
			where: {
				practiceSubmissionId: submissionId,
				isCompleted: true
			}
		})

		if (reviewsSubmission && submission?.score) {
			const sumScores = reviewsSubmission.reduce(
				(sum, review) => sum + review.score,
				0
			)
			const averageSubmissionScore = sumScores / reviewsSubmission.length

			await this.prisma.practiceSubmission.update({
				where: { id: submissionId },
				data: { score: averageSubmissionScore }
			})
		}
		if (!submission?.score) {
			await this.prisma.practiceSubmission.update({
				where: { id: submissionId },
				data: { score: average }
			})
		}
		const targetReviewsPractise = await this.prisma.reviewPractise.findMany({
			where: {
				reviewerSubmissionId: reviewData.reviewerSubmissionId
			}
		})

		// is inReviewed practises exist
		const isAllReviewed = targetReviewsPractise.every(
			review => review.isCompleted === true
		)
		const userReviewer = await this.prisma.user.findUnique({
			where: { id: submission?.userId }
		})

		if (!userReviewer) {
			throw new NotFoundException('User not found')
		}
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: submission?.partId }
		})
		if (submission?.partId && coursePart?.courseId) {
			this.emailService.sendNotificationCourseTaskCheck(
				userReviewer.email,
				coursePart?.courseId,
				submission?.partId
			)
		}
		if (isAllReviewed) {
			await this.prisma.practiceSubmission.update({
				where: { id: reviewData.reviewerSubmissionId },
				data: { canReviewed: true }
			})
			return isAllReviewed

			// if (!submission) {
			// 	throw new NotFoundException('Submission not found')
			// }
			// const review = await this.prisma.reviewPractise.create({
			// 	data: {
			// 		comment: reviewData.comment,
			// 		scores: reviewData.scores,
			// 		practiceSubmissionId: submissionId,
			// 		reviewerSubmissionId: submission.reviewerSubmissionId
			// 	}
			// })
			// await this.prisma.practiceSubmission.update({
			// 	where: { id: submissionId },
			// 	data: { isReviewed: true, canReviewed: false }
			// })
		}
	}
	async reviewSubmissionWithoutReviwerSubmissionId(
		submissionId: string,
		reviewData: ReviewSubmissionIndependentDto
	) {
		const currentReview = await this.prisma.reviewPractise.create({
			data: {
				reviewerId: reviewData.reviewerId,
				practiceSubmissionId: submissionId,
				score: 0,
				isCompleted: false
			}
		})
		// const reviewsByReviewerSubmissionId =
		// 	await this.prisma.reviewPractise.findMany({
		// 		where: {
		// 			reviewerSubmissionId: reviewData.reviewerSubmissionId,
		// 			isCompleted: false
		// 		}
		// 	})
		// const review = reviewsByReviewerSubmissionId.find(
		// 	review => review.practiceSubmissionId === submissionId
		// )
		if (!currentReview) {
			throw new NotFoundException('Review not found')
		}
		if (currentReview.isCompleted) {
			throw new ConflictException('Review already completed')
		}

		await this.prisma.reviewPractiseScoreCriteria.createMany({
			data: reviewData.scores.map(score => {
				return {
					reviewPractiseId: currentReview.id,
					reviewCriteriaId: score.criteriaId,
					score: score.score
				}
			})
		})
		const scores = reviewData.scores
		const total = scores.reduce((acc, score) => acc + score.score, 0)
		const average = scores.length > 0 ? total / scores.length : 0

		await this.prisma.reviewPractise.update({
			where: { id: currentReview.id },
			data: {
				comment: reviewData.comment,
				score: average,
				isCompleted: true
			}
		})

		const submission = await this.prisma.practiceSubmission.findUnique({
			where: { id: submissionId }
		})

		const reviewsSubmission = await this.prisma.reviewPractise.findMany({
			where: {
				practiceSubmissionId: submissionId,
				isCompleted: true
			}
		})

		if (reviewsSubmission && submission?.score) {
			const sumScores = reviewsSubmission.reduce(
				(sum, review) => sum + review.score,
				0
			)
			const averageSubmissionScore = sumScores / reviewsSubmission.length

			await this.prisma.practiceSubmission.update({
				where: { id: submissionId },
				data: { score: averageSubmissionScore }
			})
		}
		if (!submission?.score) {
			await this.prisma.practiceSubmission.update({
				where: { id: submissionId },
				data: { score: average }
			})
		}

		await this.prisma.user.update({
			where: { id: reviewData.reviewerId },
			data: { reviewsOverCount: { increment: 1 } }
		})
		return currentReview

		// if (!submission) {
		// 	throw new NotFoundException('Submission not found')
		// }
		// const review = await this.prisma.reviewPractise.create({
		// 	data: {
		// 		comment: reviewData.comment,
		// 		scores: reviewData.scores,
		// 		practiceSubmissionId: submissionId,
		// 		reviewerSubmissionId: submission.reviewerSubmissionId
		// 	}
		// })
		// await this.prisma.practiceSubmission.update({
		// 	where: { id: submissionId },
		// 	data: { isReviewed: true, canReviewed: false }
		// })
	}
	async getReviewCriteriasByPractiseSubmissionId(practiseSubmissionId: string) {
		const practiseSubmission = await this.prisma.practiceSubmission.findUnique({
			where: { id: practiseSubmissionId }
		})
		if (!practiseSubmission) {
			throw new NotFoundException('Practise submission not found')
		}
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: practiseSubmission.partId }
		})

		if (!coursePart) {
			throw new NotFoundException('Part not found')
		}
		if (!coursePart.coursePracticeTaskId) {
			throw new ConflictException('Part does not have a practice task')
		}

		const criterias = await this.prisma.reviewPractiseCriteria.findMany({
			where: { coursePractiseId: coursePart.coursePracticeTaskId }
		})
		if (!criterias) {
			throw new NotFoundException('No review criterias found')
		}
		console.log('criterias', criterias)
		return criterias
	}
	async getComplaintReview(reviewId: string, reviewedUserId: string) {
		const complaintReview = await this.prisma.reviewComplaint.findFirst({
			where: {
				reviewPractiseId: reviewId,
				reviewedUserId: reviewedUserId
			}
		})
		if (!complaintReview) {
			return null
		}
		console.log('complaintReview', complaintReview)
		return complaintReview
	}
	async checkReview(reviewerId: string, submissionId: string) {
		const review = await this.prisma.reviewPractise.findFirst({
			where: {
				reviewerId: reviewerId,
				practiceSubmissionId: submissionId
			}
		})
		if (!review) {
			return false
		}
		return true
	}
}
