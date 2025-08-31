import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { formatDistanceToNow } from 'date-fns'
@Injectable()
export class PractiseSolutionService {
	constructor(private prisma: PrismaService) {}
	async getSolutionById(submissionId: string) {
		const submission = await this.prisma.practiceSubmission.findUnique({
			where: { id: submissionId }
		})
		if (!submission) {
			throw new NotFoundException('Submission not found')
		}
		return submission
	}
	async getPractiseBySolutionId(submissionId: string) {
		const submission = await this.prisma.practiceSubmission.findUnique({
			where: { id: submissionId }
		})

		if (!submission) {
			throw new NotFoundException('Submission not found')
		}
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: submission.partId }
		})
		if (!coursePart) {
			throw new NotFoundException('Course part not found')
		}
		if (!coursePart.coursePracticeTaskId) {
			throw new NotFoundException('Course part does not have a practice task')
		}
		const coursePractise = await this.prisma.coursePractice.findUnique({
			where: { id: coursePart.coursePracticeTaskId }
		})

		if (!coursePractise) {
			throw new NotFoundException('Course practice not found')
		}

		const practiseReviewCriterias =
			await this.prisma.reviewPractiseCriteria.findMany({
				where: { coursePractiseId: coursePractise.id }
			})
		if (!practiseReviewCriterias) {
			throw new NotFoundException('No review criterias found')
		}
		return {
			id: coursePractise.id,
			title: coursePart.title,
			description: coursePart.description,
			previewImageUrl: coursePart.previewImageUrl,
			content: coursePractise.content,
			assestsFileUrl: coursePractise.assetsFileUrl,
			reviewCriterias: practiseReviewCriterias
		}
	}
	async getReviewsBySolutionId(submissionId: string) {
		const reviews = await this.prisma.reviewPractise.findMany({
			where: {
				practiceSubmissionId: submissionId,
				isCompleted: true
			},
			include: {
				reviewer: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				reviewPractiseScoreCriterias: {
					include: {
						reviewCriteria: {
							select: {
								title: true,
								description: true,
								id: true
							}
						}
					}
				}
			}
		})

		if (!reviews.length) {
			return null
		}

		return reviews.map(review => ({
			id: review.id,
			reviewer: {
				userId: review.reviewer.id,
				name: review.reviewer.name,
				avatarUrl: review.reviewer.avatarUrl
			},
			score: review.score,
			comment: review.comment,
			reviewPractiseScoreCriterias: review.reviewPractiseScoreCriterias.map(
				criteria => ({
					score: criteria.score,
					reviewCriteriaTitle: criteria.reviewCriteria.title,
					reviewCriteriaDescription: criteria.reviewCriteria.description,
					id: criteria.reviewCriteria.id
				})
			),
			createdAt: review.createdAt
		}))
	}

	async getPractisesSolutionsByUserId(userId: string) {
		const submissions = await this.prisma.practiceSubmission.findMany({
			where: {
				userId: userId,
				part: {
					type: 'PRACTICAL' // Фильтруем только практические задания
				}
			},
			include: {
				part: {
					include: {
						practice: true, // Включаем связанное практическое задание
						course: true // Включаем курс для получения превью изображения
					}
				}
			},
			orderBy: {
				createdAt: 'desc' // Сортировка по дате создания (новые сначала)
			}
		})

		return submissions.map(submission => ({
			id: submission.id,
			partId: submission.partId,
			title: submission.part.title,
			description: submission.part.description || '',
			imageUrl:
				submission.part.previewImageUrl ||
				submission.part.course.previewImageUrl,
			score: submission.score,
			submittedAt: formatDistanceToNow(submission.createdAt, {
				addSuffix: true
			}),
			repoUrl: submission.githubRepo
		}))
	}

	async getStandalonePractisesSolutionsByUserId(userId: string) {
		const submissions = await this.prisma.standalonePracticeSubmission.findMany(
			{
				where: {
					userId: userId
				},
				include: {
					practice: true // Включаем связанное практическое задание
				},
				orderBy: {
					createdAt: 'desc' // Сортировка по дате создания (новые сначала)
				}
			}
		)
		return submissions.map(submission => ({
			id: submission.id,
			practiseId: submission.practiceId,
			title: submission.practice.title,
			description: submission.practice.description || '',
			imageUrl: submission.practice.previewImageUrl,
			score: submission.score,
			submittedAt: formatDistanceToNow(submission.createdAt, {
				addSuffix: true
			}),
			repoUrl: submission.githubRepo
		}))
	}

	async getAllPractisesSolutionsExceptUser(userId: string) {
		const submissions = await this.prisma.practiceSubmission.findMany({
			where: {
				userId: {
					not: userId
				},
				part: {
					type: 'PRACTICAL'
				}
			},
			include: {
				part: {
					include: {
						practice: true,
						course: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return submissions.map(submission => ({
			id: submission.id,
			partId: submission.partId,
			title: submission.part.title,
			description: submission.part.description || '',
			imageUrl:
				submission.part.previewImageUrl ||
				submission.part.course.previewImageUrl,
			score: submission.score,
			submittedAt: formatDistanceToNow(submission.createdAt, {
				addSuffix: true
			}),
			repoUrl: submission.githubRepo
		}))
	}
}
