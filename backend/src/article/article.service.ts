// files.service.ts
import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article-dto'
@Injectable()
export class ArticleService {
	constructor(private prisma: PrismaService) {}

	async getArticles(filters: {
		page?: number
		limit?: number
		status?: 'published' | 'draft'
		search?: string
		tags?: string
		sortOrder?: 'asc' | 'desc'
	}) {
		if (!filters.page) filters.page = 1
		if (!filters.limit) filters.limit = 10

		const where: any = {}

		if (filters.status) {
			where.isPublished = filters.status === 'published'
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

		const [articles, total] = await Promise.all([
			this.prisma.article.findMany({
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
			this.prisma.article.count({ where })
		])

		return { data: articles, total }
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
	async getArticleById(id: string) {
		try {
			const article = await this.prisma.article.findUnique({
				where: { id },
				include: {
					tags: true
				}
			})
			if (!article) {
				throw new BadRequestException('Статья не найдена')
			}
			return article
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при получении статьи: ' + error.message
			)
		}
	}

	async createArticle(articleData: CreateArticleDto) {
		try {
			const createdArticle = await this.prisma.article.create({
				data: {
					...articleData
				}
			})
			return createdArticle
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при создании статьи: ' + error.message
			)
		}
	}

	async updateArticle(id: string, articleData: UpdateArticleDto) {
		const articleId = id
		const { tags, ...data } = articleData
		const currentArticle = await this.prisma.article.findUnique({
			where: { id: articleId },
			include: { tags: true }
		})

		if (!currentArticle) {
			throw new NotFoundException(`Article with id ${articleId} not found`)
		}

		const currentTagNames = currentArticle.tags.map(tag => tag.name)
		const tagNames = (articleData.tags ?? []).map(tag => tag.name)

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
			await this.prisma.article.update({
				where: { id: articleId },
				data: {
					...data,
					tags: {
						disconnect: tagsToRemove.map(name => ({ name }))
					}
				}
			})
		}

		// Подключаем новые теги
		else if (allTagsToConnect.length > 0) {
			await this.prisma.article.update({
				where: { id: articleId },
				data: {
					...data,
					tags: {
						connect: allTagsToConnect.map(tag => ({ id: tag.id }))
					}
				}
			})
		} else {
			await this.prisma.article.update({
				where: { id: articleId },
				data: {
					...data
				}
			})
		}

		return { success: true }
	}

	async deleteArticle(id: string) {
		try {
			const deletedArticle = await this.prisma.article.delete({
				where: { id }
			})
			return deletedArticle
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при удалении статьи: ' + error.message
			)
		}
	}

	async hideArticle(articleId: string) {
		return this.prisma.article.update({
			where: { id: articleId },
			data: { isPublished: false }
		})
	}
	async publishArticle(articleId: string) {
		return this.prisma.article.update({
			where: { id: articleId },
			data: { isPublished: true }
		})
	}
}
