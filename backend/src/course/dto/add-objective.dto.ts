import { IsString, MinLength } from 'class-validator'

export class AddObjectiveDto {
	@IsString()
	@MinLength(5, {
		message: 'Цель обучения должна содержать минимум 5 символов'
	})
	description: string
}
