import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePractiseSubmissionDto } from './dto/create-practise-submission.dto'
@Injectable()
export class PractiseSubmissionsService {
	constructor(private prisma: PrismaService) {}

	async create(data: CreatePractiseSubmissionDto) {
		return this.prisma.practiceSubmission.create({
			data: {
				userId: data.userId,
				partId: data.partId,
				githubRepo: data.githubRepo,
				challenges: data.challenges,
				learned: data.learned
			}
		})
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
