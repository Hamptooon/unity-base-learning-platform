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
	// async getCourses() {
	// 	const courses = await this.prisma.course.findMany({
	// 		orderBy: {
	// 			createdAt: 'desc'
	// 		}
	// 	})
	// 	return courses
	// }

	// course.service.ts (Nest.js)
	async getCourses(filters: {
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

		const [courses, total] = await Promise.all([
			this.prisma.course.findMany({
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
			this.prisma.course.count({ where })
		])

		return { data: courses, total }
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
				},
				tags: true
			}
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		return course
	}
	async updateCourse(id: string, courseDto: UpdateCourseDto) {
		const { learningObjectives, tags = [], ...courseData } = courseDto

		const course = await this.prisma.course.findUnique({
			where: { id },
			include: { tags: true }
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		// Получаем текущие и новые теги
		const currentTagNames = course.tags.map(tag => tag.name)
		const tagNames = tags.map(tag => tag.name)

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

		return this.prisma.$transaction(async prisma => {
			// Обновляем курс
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
					},
					// Удаляем старые теги
					...(tagsToRemove.length > 0 && {
						tags: {
							disconnect: tagsToRemove.map(name => ({ name }))
						}
					}),
					// Подключаем новые теги
					...(allTagsToConnect.length > 0 && {
						tags: {
							connect: allTagsToConnect.map(tag => ({ id: tag.id }))
						}
					})
				}
			})

			// Обновляем цели обучения
			await prisma.courseLearningObjective.deleteMany({
				where: { courseId: id }
			})

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
			// this.prisma.reviewPractiseScoreCriteria.deleteMany({
			// 	where: {
			// 		reviewPractise: {
			// 			practiceSubmission: {
			// 				part: {
			// 					courseId: id
			// 				}
			// 			}
			// 		}
			// 	}
			// }),

			// Удаляем ReviewPractise
			// this.prisma.reviewPractise.deleteMany({
			// 	where: {
			// 		practiceSubmission: {
			// 			part: {
			// 				courseId: id
			// 			}
			// 		}
			// 	}
			// }),

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

	async hideCourse(courseId: string) {
		return this.prisma.course.update({
			where: { id: courseId },
			data: { isPublished: false }
		})
	}
	async publishCourse(courseId: string) {
		return this.prisma.course.update({
			where: { id: courseId },
			data: { isPublished: true }
		})
	}
}
