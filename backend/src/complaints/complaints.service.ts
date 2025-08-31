import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ReviewComplaintDto } from './dto/review-complaint.dto'
@Injectable()
export class ComplaintsService {
	constructor(private prisma: PrismaService) {}

	async getComplaintsReviews() {
		const complaints = await this.prisma.reviewComplaint.findMany({
			where: { isApproved: false },
			include: {
				reviewedUser: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				},
				reviewerUser: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				},
				reviewPractise: {
					include: {
						practiceSubmission: {
							include: {
								part: true,
								user: {
									select: {
										id: true,
										name: true,
										email: true,
										avatarUrl: true
									}
								}
							}
						},
						reviewer: {
							select: {
								id: true,
								name: true,
								email: true,
								avatarUrl: true
							}
						},
						reviewPractiseScoreCriterias: {
							include: { reviewCriteria: true }
						}
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return Promise.all(
			complaints.map(async complaint => ({
				...complaint,
				approvedComplaintsCount: await this.prisma.reviewComplaint.count({
					where: {
						reviewerUserId: complaint.reviewerUserId,
						isApproved: true
					}
				})
			}))
		)
	}

	async rejectComplaint(id: string) {
		const complaint = await this.prisma.reviewComplaint.delete({
			where: { id }
		})
		if (!complaint) throw new NotFoundException()
	}

	async acceptComplaint(id: string) {
		const complaint = await this.prisma.reviewComplaint.findUnique({
			where: { id },
			include: { reviewPractise: { include: { practiceSubmission: true } } }
		})
		if (!complaint) throw new NotFoundException('Complaint not found')
		if (!complaint.reviewPractise)
			throw new NotFoundException('Review Practise not found')

		const reviewsBySubmission = await this.prisma.reviewPractise.findMany({
			where: {
				practiceSubmissionId: complaint.reviewPractise.practiceSubmissionId
			}
		})

		const countReviews = reviewsBySubmission.length

		if (countReviews < 2) {
			console.log('score', 0)
			await this.prisma.practiceSubmission.update({
				where: { id: complaint.reviewPractise.practiceSubmissionId },
				data: {
					score: null,
					isReviewed: true
				}
			})
		} else {
			const sumScoresReviews = reviewsBySubmission.reduce(
				(sum, review) => sum + review.score,
				0
			)
			const averageScore =
				(sumScoresReviews - complaint.reviewPractise.score) / (countReviews - 1)

			await this.prisma.practiceSubmission.update({
				where: { id: complaint.reviewPractise.practiceSubmissionId },
				data: {
					score: averageScore,
					isReviewed: true
				}
			})
			console.log('countReviews', countReviews)
			console.log('sumScoresReviews', sumScoresReviews)
			console.log('averageScore', averageScore)
		}

		// Delete related review criteria scores
		await this.prisma.reviewPractiseScoreCriteria.deleteMany({
			where: { reviewPractiseId: complaint.reviewPractise.id }
		})
		// Delete related review
		await this.prisma.reviewPractise.delete({
			where: { id: complaint.reviewPractise.id }
		})
	}

	/////

	async getComplaintsReviewsPractises() {
		const complaints = await this.prisma.reviewStandaloneComplaint.findMany({
			where: { isApproved: false },
			include: {
				reviewedUser: true,
				reviewPractise: {
					include: {
						practiceSubmission: {
							include: { practice: true, user: true }
						},
						reviewer: true,
						reviewPractiseScoreCriterias: {
							include: { reviewCriteria: true }
						}
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})
		return Promise.all(
			complaints.map(async complaint => ({
				...complaint,
				approvedComplaintsCount:
					await this.prisma.reviewStandaloneComplaint.count({
						where: {
							reviewerUserId: complaint.reviewerUserId,
							isApproved: true
						}
					})
			}))
		)
	}
	async rejectComplaintPractise(id: string) {
		const complaint = await this.prisma.reviewStandaloneComplaint.delete({
			where: { id }
		})
		if (!complaint) throw new NotFoundException()
	}

	async acceptComplaintPractise(id: string) {
		const complaint = await this.prisma.reviewStandaloneComplaint.findUnique({
			where: { id },
			include: { reviewPractise: { include: { practiceSubmission: true } } }
		})
		if (!complaint) throw new NotFoundException('Complaint not found')
		if (!complaint.reviewPractise)
			throw new NotFoundException('Review Practise not found')

		const reviewsBySubmission =
			await this.prisma.reviewStandalonePractise.findMany({
				where: {
					practiceSubmissionId: complaint.reviewPractise.practiceSubmissionId
				}
			})

		const countReviews = reviewsBySubmission.length

		if (countReviews < 2) {
			console.log('score', 0)
			await this.prisma.standalonePracticeSubmission.update({
				where: { id: complaint.reviewPractise.practiceSubmissionId },
				data: {
					score: null,
					isReviewed: true
				}
			})
		} else {
			const sumScoresReviews = reviewsBySubmission.reduce(
				(sum, review) => sum + review.score,
				0
			)
			const averageScore =
				(sumScoresReviews - complaint.reviewPractise.score) / (countReviews - 1)

			await this.prisma.standalonePracticeSubmission.update({
				where: { id: complaint.reviewPractise.practiceSubmissionId },
				data: {
					score: averageScore,
					isReviewed: true
				}
			})
			console.log('countReviews', countReviews)
			console.log('sumScoresReviews', sumScoresReviews)
			console.log('averageScore', averageScore)
		}

		// Delete related review criteria scores
		await this.prisma.standalonePractiseScoreCriteria.deleteMany({
			where: { reviewPractiseId: complaint.reviewPractise.id }
		})
		// Delete related review
		await this.prisma.reviewStandalonePractise.delete({
			where: { id: complaint.reviewPractise.id }
		})
	}

	// async rejectComplaint(id: string) {
	//   return this.prisma.reviewComplaint.delete({ where: { id } })
	// }

	async complaintReview(reviewId: string, data: ReviewComplaintDto) {
		const review = await this.prisma.reviewPractise.findUnique({
			where: { id: reviewId }
		})
		if (!review) {
			throw new NotFoundException('Review not found')
		}

		const practiseSubmission = await this.prisma.practiceSubmission.findUnique({
			where: { id: review.practiceSubmissionId }
		})
		if (!practiseSubmission) {
			throw new NotFoundException('Submission not found')
		}
		console.log('comment', review.comment)
		// Отправляем комментарий на проверку в AI
		// const toxicityScore = review.comment
		// 	? await this.analyzeComment(review.comment)
		// 	: 0

		// console.log('toxicityScore', toxicityScore)
		// Создаём запись жалобы
		const complaintReview = await this.prisma.reviewComplaint.create({
			data: {
				reviewPractiseId: reviewId,
				comment: data.comment,
				complaintType: data.complaintReviewType,
				reviewedUserId: practiseSubmission.userId,
				reviewerUserId: data.reviewerUserId
			}
		})
		// if (review.comment) {
		// 	this.analyzeAndProcessToxicity(review.comment, complaintReview.id).catch(
		// 		err => console.error('Toxicity analysis failed', err)
		// 	)
		// } else {
		// 	await this.prisma.reviewComplaint.update({
		// 		where: { id: complaintReview.id },
		// 		data: { toxicityScore: 0 }
		// 	})
		// }
		// Автоматическое принятие жалобы при высоком токсичном индексе

		return complaintReview
	}
	private async analyzeComment(comment: string): Promise<number> {
		const response = await fetch(
			'https://api.intelligence.io.solutions/api/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.IO_INTELLIGENCE_API_KEY}`
				},
				body: JSON.stringify({
					model: 'meta-llama/Llama-3.3-70B-Instruct',
					messages: [
						{
							role: 'system',
							content:
								'Ты модератор, оцени насколько хороший комментарий, оцени по токсичности, оскорбительности и содержательности в контексте отзыва на решение задания по Unity  . Верни только число от 0 до 100, где 100 - это очень плохой, а 0 - хороший комментарий. Не добавляй ничего лишнего, только число. Например: 50'
						},
						{
							role: 'user',
							content: comment
						}
					]
				})
			}
		)

		const data = await response.json()
		console.log('data', data)
		console.log('data', data.choices?.[0]?.message?.content)
		// Парсим число из ответа
		const resultText = data.choices?.[0]?.message?.content ?? '0'
		const match = resultText.match(/\d+/)
		return match ? Math.min(parseInt(match[0]), 100) : 0
	}
	private async analyzeAndProcessToxicity(
		comment: string,
		complaintId: string
	) {
		if (!comment) return

		const toxicityScore = await this.analyzeComment(comment)
		console.log('toxicityScore', toxicityScore)

		if (toxicityScore >= 80) {
			await this.acceptComplaint(complaintId)
		} else {
			await this.prisma.reviewComplaint.update({
				where: { id: complaintId },
				data: { toxicityScore }
			})
		}
	}
}
