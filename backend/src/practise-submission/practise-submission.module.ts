import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PractiseSubmissionsController } from './practise-submission.controller'
import { PractiseSubmissionsService } from './practise-submission.service'

@Module({
	controllers: [PractiseSubmissionsController],
	providers: [PractiseSubmissionsService, PrismaService]
})
export class PracticeSubmissionModule {}
