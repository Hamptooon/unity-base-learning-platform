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
// import { PractiseSolutionService } from './practise-solution.service'
import { ComplaintsService } from './complaints.service'
import { ReviewComplaintDto } from './dto/review-complaint.dto'
@Controller('complaints')
export class ComplaintsController {
	constructor(private readonly complaintsService: ComplaintsService) {}

	@Get('reviews')
	async getComplaintsReviews() {
		return await this.complaintsService.getComplaintsReviews()
	}

	@Post(':id/reject')
	async rejectComplaint(@Param('id') complaintId: string) {
		await this.complaintsService.rejectComplaint(complaintId)
	}

	@Post(':id/accept')
	async acceptComplaint(@Param('id') complaintId: string) {
		return await this.complaintsService.acceptComplaint(complaintId)
	}

	@Get('practises/reviews')
	async getComplaintsReviewsPractises() {
		return await this.complaintsService.getComplaintsReviewsPractises()
	}

	@Post('practises/:complaintId/reject')
	async rejectComplaintPractise(@Param('complaintId') complaintId: string) {
		await this.complaintsService.rejectComplaintPractise(complaintId)
	}

	@Post('practises/:complaintId/accept')
	async acceptComplaintPractise(@Param('complaintId') complaintId: string) {
		return await this.complaintsService.acceptComplaintPractise(complaintId)
	}
	@Post('complaint/:reviewId')
	async complaintReview(
		@Param('reviewId') reviewId: string,
		@Body() data: ReviewComplaintDto
	) {
		return await this.complaintsService.complaintReview(reviewId, data)
	}
}
