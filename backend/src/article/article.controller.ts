import { Get, Param, Post, Body, Put, Delete, Query } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { ArticleService } from './article.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article-dto'
@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}
	@Get()
	async getArticles(
		@Query()
		filters: {
			page?: number
			limit?: number
			status?: 'published' | 'draft'
			search?: string
			tags?: string // <--- добавили
			sortOrder?: 'asc' | 'desc'
		}
	) {
		return await this.articleService.getArticles({
			page: Number(filters.page) || 1,
			limit: Number(filters.limit) || 10,
			...filters
		})
	}

	@Get(':id')
	async getArticleById(@Param('id') id: string) {
		return await this.articleService.getArticleById(id)
	}

	@Post()
	async createArticle(@Body() articleData: CreateArticleDto) {
		return await this.articleService.createArticle(articleData)
	}

	@Put(`:id`)
	async updateArticle(
		@Param('id') id: string,
		@Body() articleData: UpdateArticleDto
	) {
		console.log('articleData', articleData)
		return await this.articleService.updateArticle(id, articleData)
	}

	@Delete(':id')
	async deleteArticle(@Param('id') id: string) {
		return await this.articleService.deleteArticle(id)
	}

	@Get(':articleId/publish')
	async publishArticle(@Param('articleId') articleId: string) {
		return this.articleService.publishArticle(articleId)
	}

	@Get(':articleId/hide')
	async hideArticle(@Param('articleId') articleId: string) {
		return this.articleService.hideArticle(articleId)
	}
}
// для проверки
