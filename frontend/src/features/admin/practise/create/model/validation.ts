import { z } from 'zod'

export const practiceCreateFormSchema = z.object({
  title: z.string().min(2).max(60),
  description: z.string().min(10).max(500)
  //   difficulty: z.enum(['NEWBIE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  //   duration: z.number().min(1).max(100)
})

export type CreatePracticeFormValues = z.infer<typeof practiceCreateFormSchema>
