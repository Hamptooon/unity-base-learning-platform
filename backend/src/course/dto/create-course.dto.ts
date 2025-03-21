// create-course.dto.ts
import { Difficulty } from '@prisma/client'
import { AddObjectiveDto } from './add-objective.dto'
import { Type } from 'class-transformer'
import {
	IsString,
	IsUrl,
	MinLength,
	IsInt,
	Min,
	Max,
	IsEnum,
	IsArray,
	ArrayNotEmpty,
	ValidateNested
} from 'class-validator'
export class CreateCourseDto {
	@IsString()
	@MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
	title: string

	@IsString()
	@MinLength(10, { message: 'Название должно содержать минимум 10 символа' })
	description: string

	@IsString()
	previewImageUrl: string

	@IsString()
	@MinLength(5, {
		message: 'Необходимые знания должны содержать минимум 5 символов'
	})
	prerequisites: string

	@IsInt()
	@Min(1, { message: 'Минимальная продолжительность - 1 час' })
	@Max(100, { message: 'Максимальная продолжительность - 100 часов' })
	duration: number

	@IsEnum(Difficulty, {
		message:
			'Сложность должна быть одной из: newbie, beginner, intermediate, advanced'
	})
	difficulty: Difficulty

	@IsArray()
	@ArrayNotEmpty({ message: 'Добавьте хотя бы одну цель обучения' })
	@ValidateNested({ each: true })
	@Type(() => AddObjectiveDto)
	objectives: AddObjectiveDto[]
}

// const courseFormSchema = z.object({
//   title: z.string().min(2, 'Название должно содержать минимум 2 символа'),
//   description: z
//     .string()
//     .min(10, 'Описание должно содержать минимум 10 символов'),
//   previewImage: z
//     .instanceof(FileList)
//     .refine(files => files.length > 0, 'Требуется изображение для превью')
//     .refine(
//       files => files[0]?.type.startsWith('image/'),
//       'Файл должен быть изображением'
//     ),
//   prerequisites: z
//     .string()
//     .min(5, 'Необходимые знания должны содержать минимум 5 символов'),
//   duration: z.coerce.number().min(1, 'Минимальная продолжительность - 1 час'),
//   difficulty: z.nativeEnum(Difficulty),
//   objectives: z
//     .array(
//       z.string().min(5, 'Цель обучения должна содержать минимум 5 символов')
//     )
//     .nonempty('Добавьте хотя бы одну цель обучения')
// })
