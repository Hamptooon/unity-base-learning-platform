import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Request,
	UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { PractiseSubmissionsService } from './practise-submission.service'
import { CreatePractiseSubmissionDto } from './dto/create-practise-submission.dto'
@Controller('submissions')
export class PractiseSubmissionsController {
	constructor(
		private readonly submissionsService: PractiseSubmissionsService
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async createSubmission(
		@Body() data: CreatePractiseSubmissionDto,
		@Request() req
	) {
		return this.submissionsService.create({
			...data,
			userId: req.user.id
		})
	}

	@Get('user/:userId/part/:partId')
	@UseGuards(JwtAuthGuard)
	async getSubmission(
		@Param('userId') userId: string,
		@Param('partId') partId: string
	) {
		return this.submissionsService.findByUserAndPart(userId, partId)
	}
}
