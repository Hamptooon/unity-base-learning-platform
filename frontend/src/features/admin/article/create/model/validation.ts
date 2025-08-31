import { z } from 'zod'
export const articleCreateFormSchema = z.object({
  title: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(40),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(200)
})
export type CreateArticleFormValues = z.infer<typeof articleCreateFormSchema>
