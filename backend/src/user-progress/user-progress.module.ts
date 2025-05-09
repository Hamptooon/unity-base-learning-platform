import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserProgressController } from './user-progress.controller'
import { UserProgressService } from './user-progress.service'

@Module({
	controllers: [UserProgressController],
	providers: [UserProgressService, PrismaService]
})
export class UserProgressModule {}
