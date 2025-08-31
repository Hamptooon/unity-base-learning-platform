import { z } from 'zod'

export const practiceFormSchema = z.object({
  title: z.string().min(2).max(60),
  description: z.string().min(10).max(500),
  content: z.string().optional(),
  previewImage: z.any().optional(),
  previewImageUrl: z.union([z.string(), z.null()]).optional(),
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
    .optional(),
  assetsFileUrl: z.union([z.string(), z.null()]).optional(),
  difficulty: z.enum(['NEWBIE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number().min(1).max(100),
  isPublished: z.boolean().default(false),
  tags: z.array(z.any()),
  criteria: z.array(z.any()).optional()
})

export type PracticeFormValues = z.infer<typeof practiceFormSchema>
