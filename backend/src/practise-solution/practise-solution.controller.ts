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
import { PractiseSolutionService } from './practise-solution.service'
@Controller('solutions')
export class PractiseSolutionController {
	constructor(
		private readonly practiseSolutionService: PractiseSolutionService
	) {}
	@Get(':id')
	async getSolutionById(@Param('id') submissionId: string) {
		return await this.practiseSolutionService.getSolutionById(submissionId)
	}

	@Get(':id/practise')
	async getPractiseBySolutionId(@Param('id') submissionId: string) {
		return await this.practiseSolutionService.getPractiseBySolutionId(
			submissionId
		)
	}

	@Get(':id/reviews')
	async getReviewsBySolutionId(@Param('id') submissionId: string) {
		const data =
			await this.practiseSolutionService.getReviewsBySolutionId(submissionId)
		console.log(data)
		return data
	}

	@Get('user/:id')
	async getPractisesSolutionsByUserId(@Param('id') userId: string) {
		return await this.practiseSolutionService.getPractisesSolutionsByUserId(
			userId
		)
	}
	@Get('practises/user/:id')
	async getStandalonePractisesSolutionsByUserId(@Param('id') userId: string) {
		return await this.practiseSolutionService.getStandalonePractisesSolutionsByUserId(
			userId
		)
	}

	@Get('coursepractises/except/:userId')
	async getCoursePractisesExceptByUserId(@Param('userId') userId: string) {
		return await this.practiseSolutionService.getAllPractisesSolutionsExceptUser(
			userId
		)
	}
}
