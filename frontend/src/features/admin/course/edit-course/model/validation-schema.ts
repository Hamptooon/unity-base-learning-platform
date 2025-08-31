import { z } from 'zod'
import { Difficulty } from '@/entities/course/model/types'
import { CoursePartType } from '@/entities/course/model/types'
const coursePartSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(CoursePartType.THEORETICAL),
    id: z.string().optional(),
    sortOrder: z.number(),
    title: z.string(),
    description: z.string(),
    previewImage: z
      .unknown()
      .transform(value => {
        return value as FileList
      })
      .refine(files => files.length > 0, 'Требуется изображение для превью')
      .refine(
        files => files[0]?.type.startsWith('image/'),
        'Файл должен быть изображением'
      )
      .optional(),
    article: z.object({
      content: z.string().optional()
    })
  }),
  z.object({
    id: z.string().optional(),
    sortOrder: z.number(),
    type: z.literal(CoursePartType.PRACTICAL),
    title: z.string(),
    description: z.string(),
    previewImage: z
      .unknown()
      .transform(value => {
        return value as FileList
      })
      .refine(files => files.length > 0, 'Требуется изображение для превью')
      .refine(
        files => files[0]?.type.startsWith('image/'),
        'Файл должен быть изображением'
      )
      .optional(),
    practice: z.object({
      content: z.string().optional(),
      assetsFile: z
        .unknown()
        .transform(value => {
          return value as FileList
        })
        .refine(files => files.length > 0, 'Требуется файл для практики')
        .refine(
          files => files[0]?.name.endsWith('.unitypackage'),
          'Файл должен быть unitypackage архивом'
        )
        .optional()
    })
  })
])
export const courseFormSchema = z.object({
  title: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов'),
  previewImage: z
    .unknown()
    .transform(value => {
      return value as FileList
    })
    .refine(files => files.length > 0, 'Требуется изображение для превью')
    .refine(
      files => files[0]?.type.startsWith('image/'),
      'Файл должен быть изображением'
    )
    .optional(),
  prerequisites: z
    .string()
    .min(5, 'Необходимые знания должны содержать минимум 5 символов')
    .optional(),
  duration: z.coerce.number().min(1, 'Минимальная продолжительность - 1 час'),
  difficulty: z.nativeEnum(Difficulty),
  learningObjectives: z
    .array(
      z.string().min(5, 'Цель обучения должна содержать минимум 5 символов')
    )
    .min(1, 'Добавьте хотя бы одну цель обучени��')
    .optional(),
  parts: z.array(coursePartSchema).optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
    .optional()
})

export type CourseFormValues = z.infer<typeof courseFormSchema>
