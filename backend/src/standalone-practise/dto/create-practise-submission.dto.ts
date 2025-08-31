// create-submission.dto.ts
import { IsString, IsUrl, IsOptional } from 'class-validator'
export class CreatePractiseSubmissionDto {
	@IsString()
	@IsUrl()
	githubRepo: string

	@IsString()
	@IsUrl()
	githubPagesUrl: string

	@IsString()
	@IsOptional()
	challenges?: string

	@IsString()
	@IsOptional()
	learned?: string

	@IsString()
	userId: string
}
