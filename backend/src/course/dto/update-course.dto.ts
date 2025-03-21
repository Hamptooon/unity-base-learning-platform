import { Difficulty } from '@prisma/client'
export class UpdateCourseDto {
	title?: string
	description?: string
	previewImageUrl?: string
	prerequisites?: string
	duration?: number
	difficulty?: Difficulty
	isPublished?: boolean
}
