import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ComplaintsService } from './complaints.service'
import { ComplaintsController } from './complaints.controller'

@Module({
	controllers: [ComplaintsController],
	providers: [ComplaintsService, PrismaService]
})
export class ComplaintsModule {}
