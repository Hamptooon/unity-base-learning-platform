// files.service.ts
import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
	ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePractiseDto } from './dto/create-practise.dto'
import { CreatePractiseCriteriaDto } from './dto/create-practise-criteria.dto'
import { UpdatePractiseDto } from './dto/update-practise.dto'
import { CreatePractiseSubmissionDto } from './dto/create-practise-submission.dto'
import { ReviewSubmissionDto } from './dto/review-submission.dto'
import { ReviewComplaintDto } from './dto/review-complaint.dto'
@Injectable()
export class PractiseService {
	constructor(private prisma: PrismaService) {}

	async getPractises(filters: {
		page?: number
		limit?: number
		status?: 'published' | 'draft'
		difficulty?: string
		durationMin?: number
		durationMax?: number
		search?: string
		tags?: string
		sortOrder?: 'asc' | 'desc'
	}) {
		if (!filters.page) filters.page = 1
		if (!filters.limit) filters.limit = 10

		const where: any = {}

		const durationMin = Number(filters.durationMin) || undefined
		const durationMax = Number(filters.durationMax) || undefined

		if (filters.status) {
			where.isPublished = filters.status === 'published'
		}

		if (filters.difficulty) {
			where.difficulty = filters.difficulty
		}

		if (durationMin !== undefined || durationMax !== undefined) {
			where.duration = {
				...(durationMin !== undefined && { gte: durationMin }),
				...(durationMax !== undefined && { lte: durationMax })
			}
		}

		if (filters.search) {
			where.title = { contains: filters.search, mode: 'insensitive' }
		}

		if (filters.tags) {
			const tagArray = filters.tags.split(',') // "tag1,tag2"
			where.tags = {
				some: {
					name: {
						in: tagArray
					}
				}
			}
		}

		const [practises, total] = await Promise.all([
			this.prisma.standalonePractice.findMany({
				where,
				skip: (filters.page - 1) * filters.limit,
				take: Number(filters.limit),
				orderBy: {
					createdAt: filters.sortOrder === 'asc' ? 'asc' : 'desc'
				},
				include: {
					tags: true
				}
			}),
			this.prisma.standalonePractice.count({ where })
		])

		return { data: practises, total }
	}

	async getPractiseById(id: string) {
		try {
			const practise = await this.prisma.standalonePractice.findUnique({
				where: { id },
				include: {
					tags: true,
					reviewCriteria: true
				}
			})
			if (!practise) {
				throw new BadRequestException('Практика не найдена')
			}
			return practise
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при получении практики: ' + error.message
			)
		}
	}

	async createPractise(practiseData: CreatePractiseDto) {
		try {
			const createdpractise = await this.prisma.standalonePractice.create({
				data: {
					...practiseData
				}
			})
			return createdpractise
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при создании практики: ' + error.message
			)
		}
	}

	async deletePractise(id: string) {
		try {
			// Получаем все связанные критерии оценки
			const criteria = await this.prisma.standalonePractiseCriteria.findMany({
				where: { practiceId: id },
				select: { id: true }
			})

			const criteriaIds = criteria.map(c => c.id)

			return this.prisma.$transaction([
				// Удаляем сначала оценки, которые ссылаются на критерии
				this.prisma.standalonePractiseScoreCriteria.deleteMany({
					where: {
						reviewCriteriaId: { in: criteriaIds }
					}
				}),
				// Удаляем критерии
				this.prisma.standalonePractiseCriteria.deleteMany({
					where: { practiceId: id }
				}),
				// Удаляем отправки практик
				this.prisma.standalonePracticeSubmission.deleteMany({
					where: {
						practiceId: id
					}
				}),
				// Удаляем ревью, привязанные к этим отправкам
				this.prisma.reviewStandalonePractise.deleteMany({
					where: { practiceSubmission: { practiceId: id } }
				}),
				// Удаляем саму практику
				this.prisma.standalonePractice.delete({
					where: { id }
				})
			])
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при удалении практики: ' + error.message
			)
		}
	}

	async updatePractise(id: string, practiseData: UpdatePractiseDto) {
		const practiseId = id
		const { tags, ...data } = practiseData
		const currentPractise = await this.prisma.standalonePractice.findUnique({
			where: { id: practiseId },
			include: { tags: true }
		})
		console.log('currentPractise', currentPractise)
		if (!currentPractise) {
			throw new NotFoundException(`Practise with id ${practiseId} not found`)
		}

		const currentTagNames = currentPractise.tags.map(tag => tag.name)
		const tagNames = (practiseData.tags ?? []).map(tag => tag.name)

		const tagsToAdd = tagNames.filter(name => !currentTagNames.includes(name))
		const tagsToRemove = currentTagNames.filter(
			name => !tagNames.includes(name)
		)

		const existingTags = await this.prisma.tag.findMany({
			where: { name: { in: tagsToAdd } }
		})

		const existingTagNames = existingTags.map(tag => tag.name)
		const newTagNames = tagsToAdd.filter(
			name => !existingTagNames.includes(name)
		)

		const newTags = await Promise.all(
			newTagNames.map(name => this.prisma.tag.create({ data: { name } }))
		)

		const allTagsToConnect = [...existingTags, ...newTags]

		// Удаляем старые связи
		if (tagsToRemove.length > 0) {
			await this.prisma.standalonePractice.update({
				where: { id: practiseId },
				data: {
					tags: {
						disconnect: tagsToRemove.map(name => ({ name }))
					}
				}
			})
		}

		// Подключаем новые теги
		else if (allTagsToConnect.length > 0) {
			await this.prisma.standalonePractice.update({
				where: { id: practiseId },
				data: {
					...data,
					tags: {
						connect: allTagsToConnect.map(tag => ({ id: tag.id }))
					}
				}
			})
		} else {
			await this.prisma.standalonePractice.update({
				where: { id: practiseId },
				data: {
					...data
				}
			})
		}

		return { success: true }
	}
	async deleteCriteria(practiseId: string, criteriaId: string) {
		try {
			const deletedCriteria =
				await this.prisma.standalonePractiseCriteria.delete({
					where: {
						id: criteriaId,
						practiceId: practiseId
					}
				})
			return deletedCriteria
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при удалении критерия: ' + error.message
			)
		}
	}

	async createCriteria(
		practiseId: string,
		criteriaData: CreatePractiseCriteriaDto
	) {
		try {
			const createdCriteria =
				await this.prisma.standalonePractiseCriteria.create({
					data: {
						...criteriaData,
						practiceId: practiseId
					}
				})
			return createdCriteria
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при создании критерия: ' + error.message
			)
		}
	}

	async updateCriteria(
		practiseId: string,
		criteriaId: string,
		criteriaData: CreatePractiseCriteriaDto
	) {
		try {
			const updatedCriteria =
				await this.prisma.standalonePractiseCriteria.update({
					where: {
						id: criteriaId,
						practiceId: practiseId
					},
					data: {
						...criteriaData
					}
				})
			return updatedCriteria
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при обновлении критерия: ' + error.message
			)
		}
	}

	/////

	async createPractiseSubmission(
		practiseId: string,
		submissionData: CreatePractiseSubmissionDto
	) {
		try {
			const createdSubmission =
				await this.prisma.standalonePracticeSubmission.create({
					data: {
						...submissionData,
						practiceId: practiseId
					}
				})
			const candidates =
				await this.prisma.standalonePracticeSubmission.findMany({
					where: {
						userId: { not: createdSubmission.userId },
						canReviewed: true,
						isReviewed: false,
						practiceId: createdSubmission.practiceId
					},
					take: 2
				})
			if (candidates.length === 0) {
				await this.prisma.standalonePracticeSubmission.update({
					where: { id: createdSubmission.id },
					data: { canReviewed: true }
				})
				return createdSubmission
			}

			await Promise.all(
				candidates.map(candidate =>
					this.prisma.reviewStandalonePractise.create({
						data: {
							reviewerId: createdSubmission.userId,
							practiceSubmissionId: candidate.id,
							reviewerSubmissionId: createdSubmission.id,
							score: 0,
							isCompleted: false
						}
					})
				)
			)
			return createdSubmission
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при создании практики: ' + error.message
			)
		}
	}

	async getPractiseSubmission(practiseId: string, userId: string) {
		try {
			const submission =
				await this.prisma.standalonePracticeSubmission.findFirst({
					where: {
						userId,
						practiceId: practiseId
					}
				})
			if (!submission) {
				return null
			}
			return submission
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при получении практики: ' + error.message
			)
		}
	}

	async getSubmissionsToReview(
		practiseId: string,
		reviewerSubmissionId: string
	) {
		try {
			const reviewSubmissions =
				await this.prisma.reviewStandalonePractise.findMany({
					where: {
						reviewerSubmissionId: reviewerSubmissionId,
						practiceSubmission: {
							practiceId: practiseId
						}
					},
					include: {
						practiceSubmission: true
					}
				})
			const submissions = reviewSubmissions.map(
				review => review.practiceSubmission
			)
			console.log('submissionsToReviewwwww', submissions)
			if (!submissions) {
				throw new BadRequestException('Практика не найдена')
			}
			return submissions
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при получении практики: ' + error.message
			)
		}
	}

	async reviewSubmission(
		submissionId: string,
		reviewData: ReviewSubmissionDto
	) {
		const reviewsByReviewerSubmissionId =
			await this.prisma.reviewStandalonePractise.findMany({
				where: {
					reviewerSubmissionId: reviewData.reviewerSubmissionId,
					isCompleted: false
				}
			})
		const review = reviewsByReviewerSubmissionId.find(
			review => review.practiceSubmissionId === submissionId
		)

		if (!review) {
			console.log('Review not found')
			throw new NotFoundException('Review not found')
		}
		if (review.isCompleted) {
			throw new ConflictException('Review already completed')
		}

		await this.prisma.standalonePractiseScoreCriteria.createMany({
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

		await this.prisma.reviewStandalonePractise.update({
			where: { id: review.id },
			data: {
				comment: reviewData.comment,
				score: average,
				isCompleted: true
			}
		})

		const submission =
			await this.prisma.standalonePracticeSubmission.findUnique({
				where: { id: submissionId }
			})

		const reviewsSubmission =
			await this.prisma.reviewStandalonePractise.findMany({
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

			await this.prisma.standalonePracticeSubmission.update({
				where: { id: submissionId },
				data: { score: averageSubmissionScore }
			})
		}
		if (!submission?.score) {
			await this.prisma.standalonePracticeSubmission.update({
				where: { id: submissionId },
				data: { score: average }
			})
		}
		const targetReviewsPractise =
			await this.prisma.reviewStandalonePractise.findMany({
				where: {
					reviewerSubmissionId: reviewData.reviewerSubmissionId
				}
			})

		// is inReviewed practises exist
		const isAllReviewed = targetReviewsPractise.every(
			review => review.isCompleted === true
		)

		if (isAllReviewed) {
			await this.prisma.standalonePracticeSubmission.update({
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

	async getReviewsBySolutionId(submissionId: string) {
		console.log('submissionId', submissionId)
		const reviews = await this.prisma.reviewStandalonePractise.findMany({
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
		console.log('reviews', reviews)
		if (!reviews.length) {
			console.log('No reviews found')
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

	async complaintReview(reviewId: string, data: ReviewComplaintDto) {
		const review = await this.prisma.reviewStandalonePractise.findUnique({
			where: { id: reviewId }
		})
		if (!review) {
			throw new NotFoundException('Review not found')
		}
		const practiseSubmission =
			await this.prisma.standalonePracticeSubmission.findUnique({
				where: { id: review.practiceSubmissionId }
			})
		if (!practiseSubmission) {
			throw new NotFoundException('Submission not found')
		}

		// await this.prisma.reviewPractise.update({
		// 	where: { id: reviewId },
		// 	data: { isCompleted: false }
		// })
		const complaintReview = await this.prisma.reviewStandaloneComplaint.create({
			data: {
				reviewPractiseId: reviewId,
				comment: data.comment,
				complaintType: data.complaintReviewType,
				reviewedUserId: practiseSubmission.userId,
				reviewerUserId: data.reviewerUserId
			}
		})
		return complaintReview
	}
	async getComplaintReview(reviewId: string, reviewedUserId: string) {
		const complaintReview =
			await this.prisma.reviewStandaloneComplaint.findFirst({
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

	async hidePractise(practiseId: string) {
		return this.prisma.standalonePractice.update({
			where: { id: practiseId },
			data: { isPublished: false }
		})
	}
	async publishPractise(practiseId: string) {
		return this.prisma.standalonePractice.update({
			where: { id: practiseId },
			data: { isPublished: true }
		})
	}
}
