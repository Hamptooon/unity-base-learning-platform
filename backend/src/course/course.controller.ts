import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
	UseGuards,
	Req
} from '@nestjs/common'
import { CourseService } from './course.service'
import { AuthGuard } from '@nestjs/passport'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { AddObjectiveDto } from './dto/add-objective.dto'
import { CreateCourseArticleDto } from './dto/create-course-article.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Role } from '@prisma/client'
import { Request } from 'express'
@Controller('courses')
export class CourseController {
	constructor(private readonly courseService: CourseService) {}

	@Post()
	async createCourse(@Body() data: CreateCourseDto) {
		console.log('data', data)
		const course = await this.courseService.createCourse(data)
		return course
	}

	@Post('articles')
	async createCourseArticle(@Body() data: CreateCourseArticleDto) {
		console.log('data', data)
		const course = await this.courseService.createCourseArticle(data)
		return course
	}

	@Get()
	async getAllCourses() {
		const courses = await this.courseService.getAllCourses()
		return courses
	}

	// @Get()
	// async findAllCourses() {
	// 	return this.courseService.findAllCourses()
	// }

	// @Get(':id')
	// async findCourseById(@Param('id') id: string) {
	// 	return this.courseService.findCourseById(id)
	// }

	// @Patch(':id')
	// async updateCourse(
	// 	@Param('id') courseId: string,
	// 	@Body() updateCourseDto: UpdateCourseDto
	// ) {
	// 	return this.courseService.updateCourse(courseId, updateCourseDto)
	// }

	// @Delete(':id')
	// async deleteCourse(@Param('id') courseId: string) {
	// 	return this.courseService.deleteCourse(courseId)
	// }

	// @Post(':id/publish')
	// async publishCourse(@Param('id') courseId: string) {
	// 	return this.courseService.publishCourse(courseId)
	// }

	// @Post(':id/objectives')
	// async addObjective(
	// 	@Param('id') courseId: string,
	// 	@Body() addObjectiveDto: AddObjectiveDto
	// ) {
	// 	return this.courseService.addObjective(courseId, addObjectiveDto)
	// }
}
