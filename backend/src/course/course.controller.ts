import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Delete,
	Put,
	Query
} from '@nestjs/common'
import { CourseService } from './course.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { CreateCoursePartDto } from './dto/create-course-part.dto'
import { CreateReviewCriteriaDto } from './dto/create-review-criteria.dto'
import { AuthGuard } from '@nestjs/passport'
import { UseGuards } from '@nestjs/common/decorators'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'
@Controller('courses')
export class CourseController {
	constructor(private readonly courseService: CourseService) {}

	@Post()
	@UseGuards(AuthGuard('jwt'))
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(Role.ADMIN)
	async createCourse(@Body() createCourseDto: CreateCourseDto) {
		const course = await this.courseService.createCourse(createCourseDto)
		return course
	}

	@Put(':id')
	async updateCourse(
		@Param('id') id: string,
		@Body() updateCourseDto: UpdateCourseDto
	) {
		const course = await this.courseService.updateCourse(id, updateCourseDto)
		return course
	}
	@Get()
	async getCourses(
		@Query()
		filters: {
			page?: number
			limit?: number
			status?: 'published' | 'draft'
			difficulty?: string
			durationMin?: number
			durationMax?: number
			search?: string
			tags?: string // <--- добавили
			sortOrder?: 'asc' | 'desc'
		}
	) {
		return this.courseService.getCourses({
			page: Number(filters.page) || 1,
			limit: Number(filters.limit) || 10,
			...filters
		})
	}

	@Get(':id')
	async getCourseById(@Param('id') id: string) {
		const course = await this.courseService.getCourseById(id)
		return course
	}
	@Get('parts/:partId')
	async getCoursePartById(@Param('partId') partId: string) {
		const coursePart = await this.courseService.getCoursePartById(partId)
		return coursePart
	}

	@Post(':courseId/parts')
	async createCoursePart(
		@Param('courseId') courseId: string,
		@Body() createCoursePartDto: CreateCoursePartDto
	) {
		return this.courseService.createCoursePart(courseId, createCoursePartDto)
	}
	@Delete(':courseId/parts/:partId')
	async deleteCoursePart(
		@Param('courseId') courseId: string,
		@Param('partId') partId: string
	) {
		return this.courseService.deleteCoursePart(courseId, partId)
	}

	@Get(':courseId/parts')
	async getCourseParts(@Param('courseId') courseId: string) {
		const courseParts = await this.courseService.getCourseParts(courseId)
		return courseParts
	}

	@Delete(':id')
	async deleteCourse(@Param('id') id: string) {
		const course = await this.courseService.deleteCourse(id)
		return course
	}

	@Get(':courseId/parts/:partId/:practiseId/reviews-criterias')
	async getReviewsCriterias(
		@Param('courseId') courseId: string,
		@Param('partId') partId: string,
		@Param('practiseId') practiseId: string
	) {
		const reviewsCriterias = await this.courseService.getReviewsCriterias(
			courseId,
			partId,
			practiseId
		)
		return reviewsCriterias
	}

	@Post(':courseId/parts/:partId/:practiseId/reviews-criterias')
	async createReviewsCriteria(
		@Param('courseId') courseId: string,
		@Param('partId') partId: string,
		@Param('practiseId') practiseId: string,
		@Body() reviewCriteria: CreateReviewCriteriaDto
	) {
		const reviewsCriterias = await this.courseService.createReviewCriteria(
			courseId,
			partId,
			practiseId,
			reviewCriteria
		)
		return reviewsCriterias
	}
	// course.controller.ts
	@Put(':courseId/parts/:partId/:practiseId/reviews-criterias/:criteriaId')
	async updateReviewCriteria(
		@Param('courseId') courseId: string,
		@Param('partId') partId: string,
		@Param('practiseId') practiseId: string,
		@Param('criteriaId') criteriaId: string,
		@Body() reviewCriteria: CreateReviewCriteriaDto
	) {
		return this.courseService.updateReviewCriteria(
			courseId,
			partId,
			practiseId,
			criteriaId,
			reviewCriteria
		)
	}

	@Delete(':courseId/parts/:partId/:practiseId/reviews-criterias/:criteriaId')
	async deleteReviewCriteria(
		@Param('courseId') courseId: string,
		@Param('partId') partId: string,
		@Param('practiseId') practiseId: string,
		@Param('criteriaId') criteriaId: string
	) {
		return this.courseService.deleteReviewCriteria(
			courseId,
			partId,
			practiseId,
			criteriaId
		)
	}

	@Get(':courseId/publish')
	async publishCourse(@Param('courseId') courseId: string) {
		return this.courseService.publishCourse(courseId)
	}

	@Get(':courseId/hide')
	async hideCourse(@Param('courseId') courseId: string) {
		return this.courseService.hideCourse(courseId)
	}
}
