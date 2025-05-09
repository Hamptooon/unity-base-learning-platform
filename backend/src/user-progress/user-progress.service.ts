import {
	Injectable,
	NotFoundException,
	ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserProgressService {
	constructor(private prisma: PrismaService) {}

	async createUserProgress(userId: string, courseId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})
		if (!user) {
			throw new NotFoundException('User not found')
		}

		const course = await this.prisma.course.findUnique({
			where: { id: courseId }
		})
		if (!course) {
			throw new NotFoundException('Course not found')
		}
		const courseParts = await this.prisma.coursePart.findMany({
			where: { courseId: course.id }
		})
		const sortedCourseParts = courseParts.sort(
			(a, b) => a.sortOrder - b.sortOrder
		)
		const existingProgress = await this.prisma.userProgress.findFirst({
			where: {
				userId,
				courseId
			}
		})

		if (existingProgress) {
			throw new ConflictException('User progress already exists')
		}

		const progress = await this.prisma.userProgress.create({
			data: {
				userId,
				courseId,
				completedParts: [], // Замените на ваши данные прогресса
				currentCoursePartId: sortedCourseParts[0].id // Устанавливаем первый элемент в качестве текущего
			}
		})

		return progress
	}

	async getUserProgress(userId: string, courseId: string) {
		const progress = await this.prisma.userProgress.findFirst({
			where: {
				userId,
				courseId
			}
		})

		if (!progress) {
			return null // Или выбросьте исключение, если прогресс не найден
		}

		return progress
	}

	async completePart(userId: string, courseId: string, partId: string) {
		const progress = await this.prisma.userProgress.findFirst({
			where: { userId, courseId },
			include: { course: { include: { parts: true } } }
		})

		if (!progress) throw new NotFoundException('Прогресс не найден')

		const courseParts = progress.course.parts.sort(
			(a, b) => a.sortOrder - b.sortOrder
		)
		const currentIndex = courseParts.findIndex(p => p.id === partId)

		if (currentIndex === -1) throw new NotFoundException('Часть не найдена')

		const isLastPart = currentIndex === courseParts.length - 1

		return this.prisma.userProgress.update({
			where: { id: progress.id },
			data: {
				completedParts: [...new Set([...progress.completedParts, partId])],
				currentCoursePartId: isLastPart
					? null
					: courseParts[currentIndex + 1].id,
				progress: Math.round(((currentIndex + 1) / courseParts.length) * 100)
			}
		})
	}
}
