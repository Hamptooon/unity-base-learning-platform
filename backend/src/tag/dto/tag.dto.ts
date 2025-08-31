import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator'
export class TagDto {
	@IsString()
	name: string
}
