import { IsString } from 'class-validator'
export class CreatePractiseCriteriaDto {
	@IsString()
	title: string
	@IsString()
	description: string
}
