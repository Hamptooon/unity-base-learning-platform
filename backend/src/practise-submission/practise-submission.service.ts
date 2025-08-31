import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePractiseSubmissionDto } from './dto/create-practise-submission.dto'
@Injectable()
export class PractiseSubmissionsService {
	constructor(private prisma: PrismaService) {}

	async create(practiseSubmission: CreatePractiseSubmissionDto) {
		const createdSubmission = await this.prisma.practiceSubmission.create({
			data: {
				...practiseSubmission
			}
		})
		const user = await this.prisma.user.findUnique({
			where: { id: createdSubmission.userId }
		})
		if (!user) {
			throw new Error('User not found')
		}
		if (user?.reviewsOverCount - 2 >= 0) {
			await this.prisma.practiceSubmission.update({
				where: { id: createdSubmission.id },
				data: { canReviewed: true }
			})

			await this.prisma.user.update({
				where: { id: user.id },
				data: { reviewsOverCount: user.reviewsOverCount - 2 }
			})
			return createdSubmission
		}
		const candidates = await this.prisma.practiceSubmission.findMany({
			where: {
				userId: { not: practiseSubmission.userId },
				canReviewed: true,
				isReviewed: false,
				partId: createdSubmission.partId
			},
			take: 2
		})
		if (candidates.length === 0) {
			await this.prisma.practiceSubmission.update({
				where: { id: createdSubmission.id },
				data: { canReviewed: true }
			})
			return createdSubmission
		}

		await Promise.all(
			candidates.map(candidate =>
				this.prisma.reviewPractise.create({
					data: {
						reviewerId: practiseSubmission.userId,
						practiceSubmissionId: candidate.id,
						reviewerSubmissionId: createdSubmission.id,
						score: 0,
						isCompleted: false
					}
				})
			)
		)

		return createdSubmission
	}

	async findByUserAndPart(userId: string, partId: string) {
		return this.prisma.practiceSubmission.findFirst({
			where: {
				userId,
				partId
			}
		})
	}
}
