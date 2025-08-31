import { IsString } from 'class-validator'
export class TextCheckDto {
	@IsString()
	comment: string
}
