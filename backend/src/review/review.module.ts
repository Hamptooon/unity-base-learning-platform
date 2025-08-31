import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ReviewController } from './review.controller'
import { ReviewService } from './review.service'
import { EmailModule } from '@/email/email.module'
@Module({
	imports: [EmailModule],
	controllers: [ReviewController],
	providers: [ReviewService, PrismaService]
})
export class ReviewModule {}
