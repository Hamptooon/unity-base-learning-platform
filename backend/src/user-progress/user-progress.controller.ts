import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
	UseGuards,
	Req,
	Put
} from '@nestjs/common'
import { UserProgressService } from './user-progress.service'

@Controller('user-progress')
export class UserProgressController {
	constructor(private readonly userProgressService: UserProgressService) {}

	@Post(':userId/courses/:courseId')
	async createUserProgress(
		@Param('userId') userId: string,
		@Param('courseId') courseId: string,
		@Body() data: any // Замените any на ваш DTO
	) {
		const progress = await this.userProgressService.createUserProgress(
			userId,
			courseId
		)
		return progress
	}

	@Get(':userId/courses/:courseId')
	async getUserProgressByCourse(
		@Param('userId') userId: string,
		@Param('courseId') courseId: string
	) {
		const progress = await this.userProgressService.getUserProgress(
			userId,
			courseId
		)
		return progress
	}

	@Post(':userId/complete-part/:courseId/:partId')
	async completePart(
		@Param('userId') userId: string,
		@Param('courseId') courseId: string,
		@Param('partId') partId: string
	) {
		return this.userProgressService.completePart(userId, courseId, partId)
	}
}
