import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './user/user.module'
import { PrismaModule } from './prisma/prisma.module'
import { EmailModule } from './email/email.module'
import { CourseModule } from './course/course.module'
import { FilesModule } from './files/files.module'
import { UserProgressModule } from './user-progress/user-progress.module'
import { PracticeSubmissionModule } from './practise-submission/practise-submission.module'
import { ReviewModule } from './review/review.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
		EmailModule,
		CourseModule,
		FilesModule,
		UserProgressModule,
		PracticeSubmissionModule,
		ReviewModule
	]
})
export class AppModule {}
