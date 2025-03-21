import {
	Injectable,
	NotFoundException,
	ConflictException,
	ForbiddenException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
	Course,
	CourseArticle,
	CourseLearningObjective,
	Difficulty,
	Role
} from '@prisma/client'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { AddObjectiveDto } from './dto/add-objective.dto'
import { CreateCourseArticleDto } from './dto/create-course-article.dto'
import { PartType } from '@prisma/client'
@Injectable()
export class CourseService {
	constructor(private prisma: PrismaService) {}

	async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
		const { objectives, ...courseData } = createCourseDto

		return this.prisma.$transaction(async prisma => {
			const course = await prisma.course.create({
				data: {
					...courseData,
					learningObjectives: {
						create: objectives.map((obj, index) => ({
							description: obj.description,
							sortOrder: index + 1
						}))
					}
				},
				include: {
					learningObjectives: true
				}
			})

			return course
		})
	}
	async createCourseArticle(
		createCourseArticleDto: CreateCourseArticleDto
	): Promise<CourseArticle> {
		const { courseId, sortOrder, ...courseArticleData } = createCourseArticleDto

		return this.prisma.$transaction(async prisma => {
			// Создаем статью
			const courseArticle = await prisma.courseArticle.create({
				data: { ...courseArticleData }
			})

			// Создаем часть курса, привязанную к статье
			await prisma.coursePart.create({
				data: {
					courseId,
					sortOrder,
					courseArticleId: courseArticle.id, // Было courseArticleId — ошибка!
					type: PartType.THEORETICAL
				}
			})

			return courseArticle
		})
	}

	async getAllCourses() {
		const courses = await this.prisma.course.findMany({
			include: {
				learningObjectives: {
					orderBy: {
						sortOrder: 'asc'
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		return courses
	}
	// async findAllCourses(filter: { published?: boolean } = {}) {
	// 	return this.prisma.course.findMany({
	// 		where: {
	// 			isPublished: filter.published
	// 		},
	// 		include: {
	// 			learningObjectives: {
	// 				orderBy: {
	// 					sortOrder: 'asc'
	// 				}
	// 			}
	// 		},
	// 		orderBy: {
	// 			createdAt: 'desc'
	// 		}
	// 	})
	// }

	// async findCourseById(id: string) {
	// 	const course = await this.prisma.course.findUnique({
	// 		where: { id },
	// 		include: {
	// 			learningObjectives: {
	// 				orderBy: {
	// 					sortOrder: 'asc'
	// 				}
	// 			}
	// 		}
	// 	})

	// 	if (!course) {
	// 		throw new NotFoundException('Курс не найден')
	// 	}

	// 	return course
	// }

	// async updateCourse(
	// 	userId: string,
	// 	courseId: string,
	// 	updateCourseDto: UpdateCourseDto
	// ) {
	// 	const course = await this.findCourseById(courseId)

	// 	return this.prisma.course.update({
	// 		where: { id: courseId },
	// 		data: updateCourseDto,
	// 		include: {
	// 			learningObjectives: true
	// 		}
	// 	})
	// }

	// async deleteCourse(userId: string, courseId: string) {
	// 	const course = await this.findCourseById(courseId)

	// 	// if (course.authorId !== userId) {
	// 	// 	throw new ForbiddenException('Вы не являетесь автором этого курса')
	// 	// }

	// 	return this.prisma.$transaction([
	// 		this.prisma.courseLearningObjective.deleteMany({
	// 			where: { courseId }
	// 		}),
	// 		this.prisma.course.delete({
	// 			where: { id: courseId }
	// 		})
	// 	])
	// }

	// async publishCourse(userId: string, courseId: string) {
	// 	const course = await this.findCourseById(courseId)

	// 	// if (course.authorId !== userId) {
	// 	// 	throw new ForbiddenException('Вы не являетесь автором этого курса')
	// 	// }

	// 	if (course.isPublished) {
	// 		throw new ConflictException('Курс уже опубликован')
	// 	}

	// 	return this.prisma.course.update({
	// 		where: { id: courseId },
	// 		data: { isPublished: true }
	// 	})
	// }

	// async addObjective(
	// 	userId: string,
	// 	courseId: string,
	// 	addObjectiveDto: AddObjectiveDto
	// ) {
	// 	const course = await this.findCourseById(courseId)

	// 	// if (course.authorId !== userId) {
	// 	// 	throw new ForbiddenException('Вы не являетесь автором этого курса')
	// 	// }

	// 	const lastObjective = await this.prisma.courseLearningObjective.findFirst({
	// 		where: { courseId },
	// 		orderBy: { sortOrder: 'desc' }
	// 	})

	// 	const newSortOrder = lastObjective ? lastObjective.sortOrder + 1 : 1

	// 	return this.prisma.courseLearningObjective.create({
	// 		data: {
	// 			...addObjectiveDto,
	// 			courseId,
	// 			sortOrder: newSortOrder
	// 		}
	// 	})
	// }

	// async updateObjective(
	// 	userId: string,
	// 	objectiveId: string,
	// 	updateData: Partial<CourseLearningObjective>
	// ) {
	// 	const objective = await this.prisma.courseLearningObjective.findUnique({
	// 		where: { id: objectiveId },
	// 		include: { course: true }
	// 	})

	// 	if (!objective) {
	// 		throw new NotFoundException('Цель обучения не найдена')
	// 	}

	// 	// if (objective.course.authorId !== userId) {
	// 	// 	throw new ForbiddenException('Вы не являетесь автором этого курса')
	// 	// }

	// 	return this.prisma.courseLearningObjective.update({
	// 		where: { id: objectiveId },
	// 		data: updateData
	// 	})
	// }

	// async deleteObjective(userId: string, objectiveId: string) {
	// 	const objective = await this.prisma.courseLearningObjective.findUnique({
	// 		where: { id: objectiveId },
	// 		include: { course: true }
	// 	})

	// 	if (!objective) {
	// 		throw new NotFoundException('Цель обучения не найдена')
	// 	}

	// 	// if (objective.course.authorId !== userId) {
	// 	// 	throw new ForbiddenException('Вы не являетесь автором этого курса')
	// 	// }

	// 	return this.prisma.courseLearningObjective.delete({
	// 		where: { id: objectiveId }
	// 	})
	// }
}
