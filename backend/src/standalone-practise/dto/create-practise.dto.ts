import { IsString } from 'class-validator'
export class CreatePractiseDto {
	@IsString()
	title: string
	@IsString()
	description: string
}
