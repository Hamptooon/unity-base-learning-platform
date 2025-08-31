import { z } from 'zod'

export const articleFormSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов'),
  description: z.string().min(20, 'Минимум 20 символов'),
  content: z.string().optional(),
  previewImageUrl: z.union([z.string(), z.null()]).optional(),
  isPublished: z.boolean().default(false),
  previewImage: z.any().optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
    .optional()
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>
