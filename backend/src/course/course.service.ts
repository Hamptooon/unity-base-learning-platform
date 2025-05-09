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
	CoursePractice
} from '@prisma/client'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { CreateCoursePartDto } from './dto/create-course-part.dto'
import { PartType } from '@prisma/client'
import { CreateReviewCriteriaDto } from './dto/create-review-criteria.dto'
@Injectable()
export class CourseService {
	constructor(private prisma: PrismaService) {}

	async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
		return this.prisma.course.create({
			data: {
				...createCourseDto
			}
		})
	}

	async getCourseParts(courseId: string) {
		const course = await this.prisma.course.findUnique({
			where: { id: courseId },
			include: {
				parts: {
					include: {
						article: true,
						practice: true
					},
					orderBy: {
						sortOrder: 'asc'
					}
				}
			}
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		return course.parts
	}
	async getCourses() {
		const courses = await this.prisma.course.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		})
		return courses
	}

	async getCourseById(id: string) {
		const course = await this.prisma.course.findUnique({
			where: { id },
			include: {
				learningObjectives: {
					orderBy: {
						sortOrder: 'asc'
					}
				},
				parts: {
					include: {
						article: true,
						practice: true
					},
					orderBy: {
						sortOrder: 'asc'
					}
				}
			}
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		return course
	}
	async updateCourse(id: string, courseDto: UpdateCourseDto) {
		const { learningObjectives, ...courseData } = courseDto
		const course = await this.prisma.course.findUnique({
			where: { id }
		})
		if (!course) {
			throw new NotFoundException('Курс не найден')
		}
		console.log('practice', courseData.parts[0].practice)
		return this.prisma.$transaction(async prisma => {
			const updatedCourse = await prisma.course.update({
				where: { id },
				data: {
					...courseData,
					parts: {
						upsert: courseData.parts.map(part => ({
							where: { id: part.id },
							update: {
								...part,
								article: part.article ? { update: part.article } : undefined,
								practice: part.practice ? { update: part.practice } : undefined
							},
							create: {
								...part,
								title: part.title,
								description: part.description,
								article: part.article ? { create: part.article } : undefined,
								practice: part.practice ? { create: part.practice } : undefined
							}
						}))
					}
				}
			})
			// Удаляем старые цели обучения
			await prisma.courseLearningObjective.deleteMany({
				where: { courseId: id }
			})
			// Создаем новые цели обучения
			await prisma.courseLearningObjective.createMany({
				data: learningObjectives.map((obj, index) => ({
					description: obj.description,
					sortOrder: index + 1,
					courseId: id
				}))
			})
			return updatedCourse
		})
	}
	// }
	async createCoursePart(
		courseId: string,
		createCoursePartDto: CreateCoursePartDto
	) {
		const { type, sortOrder } = createCoursePartDto
		console.log('createCoursePartDto', createCoursePartDto)
		return this.prisma.$transaction(async prisma => {
			// Проверяем существование курса
			const course = await prisma.course.findUnique({
				where: { id: courseId }
			})
			if (!course) {
				throw new NotFoundException('Курс не найден')
			}

			// Проверяем уникальность sortOrder
			const existingPart = await prisma.coursePart.findFirst({
				where: {
					courseId,
					sortOrder
				}
			})
			if (existingPart) {
				throw new ConflictException(
					'Часть курса с таким порядковым номером уже существует'
				)
			}

			let courseArticle: CourseArticle | null = null
			let coursePractice: CoursePractice | null = null

			// Создаем связанную сущность в зависимости от типа
			if (type === PartType.THEORETICAL) {
				courseArticle = await prisma.courseArticle.create({
					data: {}
				})
			} else {
				coursePractice = await prisma.coursePractice.create({
					data: {}
				})
			}

			// Создаем саму часть курса
			const coursePart = await prisma.coursePart.create({
				data: {
					courseId,
					type,
					sortOrder,
					courseArticleId: courseArticle?.id,
					coursePracticeTaskId: coursePractice?.id,
					title: createCoursePartDto.title,
					description: createCoursePartDto.description
				},
				include: {
					article: true,
					practice: true
				}
			})

			return coursePart
		})
	}
	async deleteCoursePart(courseId: string, partId: string) {
		const course = await this.prisma.course.findUnique({
			where: { id: courseId }
		})
		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: partId }
		})
		if (!coursePart) {
			throw new NotFoundException('Часть курса не найдена')
		}

		return this.prisma.coursePart.delete({
			where: { id: partId }
		})
	}

	async getCoursePartById(partId: string) {
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: partId },
			include: {
				article: true,
				practice: true
			}
		})
		if (!coursePart) {
			throw new NotFoundException('Часть курса не найдена')
		}

		return coursePart
	}
	async deleteCourse(id: string) {
		return this.prisma.$transaction([
			// Удаляем ReviewPractiseScoreCriteria
			this.prisma.reviewPractiseScoreCriteria.deleteMany({
				where: {
					reviewPractise: {
						practiceSubmission: {
							part: {
								courseId: id
							}
						}
					}
				}
			}),

			// Удаляем ReviewPractise
			this.prisma.reviewPractise.deleteMany({
				where: {
					practiceSubmission: {
						part: {
							courseId: id
						}
					}
				}
			}),

			// Удаляем ReviewPractiseCriteria
			this.prisma.reviewPractiseCriteria.deleteMany({
				where: {
					coursePractise: {
						coursePart: {
							courseId: id
						}
					}
				}
			}),

			// Удаляем PracticeSubmission
			this.prisma.practiceSubmission.deleteMany({
				where: {
					part: {
						courseId: id
					}
				}
			}),

			// Удаляем CourseArticle
			this.prisma.courseArticle.deleteMany({
				where: {
					coursePart: {
						courseId: id
					}
				}
			}),

			// Удаляем CoursePractice
			this.prisma.coursePractice.deleteMany({
				where: {
					coursePart: {
						courseId: id
					}
				}
			}),

			// Удаляем CoursePart
			this.prisma.coursePart.deleteMany({
				where: {
					courseId: id
				}
			}),

			// Удаляем цели курса
			this.prisma.courseLearningObjective.deleteMany({
				where: {
					courseId: id
				}
			}),

			// Удаляем сам курс
			this.prisma.course.delete({
				where: { id }
			})
		])
	}

	async getReviewsCriterias(
		courseId: string,
		partId: string,
		practiseId: string
	) {
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: partId },
			include: {
				course: true
			}
		})
		if (!coursePart) {
			throw new NotFoundException('Часть курса не найдена')
		}
		if (coursePart.courseId !== courseId) {
			throw new ForbiddenException('Нет доступа к этой части курса')
		}
		return this.prisma.reviewPractiseCriteria.findMany({
			where: { coursePractiseId: practiseId }
		})
	}

	async createReviewCriteria(
		courseId: string,
		partId: string,
		practiseId: string,
		reviewCriteria: CreateReviewCriteriaDto
	) {
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: partId },
			include: {
				course: true
			}
		})
		if (!coursePart) {
			throw new NotFoundException('Часть курса не найдена')
		}
		if (coursePart.courseId !== courseId) {
			throw new ForbiddenException('Нет доступа к этой части курса')
		}
		return this.prisma.reviewPractiseCriteria.create({
			data: {
				coursePractiseId: practiseId,
				description: reviewCriteria.description,
				title: reviewCriteria.title
			}
		})
	}
	// course.service.ts
	async updateReviewCriteria(
		courseId: string,
		partId: string,
		practiseId: string,
		criteriaId: string,
		data: CreateReviewCriteriaDto
	) {
		await this.validateCoursePartAccess(courseId, partId, practiseId)

		return this.prisma.reviewPractiseCriteria.update({
			where: { id: criteriaId },
			data: {
				title: data.title,
				description: data.description
			}
		})
	}

	async deleteReviewCriteria(
		courseId: string,
		partId: string,
		practiseId: string,
		criteriaId: string
	) {
		await this.validateCoursePartAccess(courseId, partId, practiseId)

		return this.prisma.reviewPractiseCriteria.delete({
			where: { id: criteriaId }
		})
	}

	private async validateCoursePartAccess(
		courseId: string,
		partId: string,
		practiseId: string
	) {
		const coursePart = await this.prisma.coursePart.findUnique({
			where: { id: partId },
			include: {
				course: true,
				practice: true
			}
		})

		if (!coursePart) {
			throw new NotFoundException('Часть курса не найдена')
		}

		if (coursePart.courseId !== courseId) {
			throw new ForbiddenException('Нет доступа к этому курсу')
		}

		if (coursePart.practice?.id !== practiseId) {
			throw new ForbiddenException('Нет доступа к этой практике')
		}
	}
}
