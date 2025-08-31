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
import { ArticleModule } from './article/article.module'
import { PractiseSolutionModule } from './practise-solution/practise-solution.module'
import { ComplaintsModule } from './complaints/complaints.module'
import { TagModule } from './tag/tag.module'
import { PractiseModule } from './standalone-practise/standalone-practise.module'
import { AiModule } from './ai/ai.module'

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
		ReviewModule,
		ArticleModule,
		PractiseSolutionModule,
		ComplaintsModule,
		TagModule,
		PractiseModule,
		AiModule
	]
})
export class AppModule {}
