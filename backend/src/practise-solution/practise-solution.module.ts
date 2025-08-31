import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PractiseSolutionController } from './practise-solution.controller'
import { PractiseSolutionService } from './practise-solution.service'

@Module({
	controllers: [PractiseSolutionController],
	providers: [PractiseSolutionService, PrismaService]
})
export class PractiseSolutionModule {}
