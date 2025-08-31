import { toast } from 'react-toastify'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { CoursePart } from '@/entities/course/model/types'
import { useUser } from '@/features/auth/provider/user-provider'
import { courseService } from '@/entities/course/api/course.service'
import { on } from 'events'
import { PracticeSubmission } from '@/entities/user/model/types'
import {
  StandalonePractice,
  StandalonePracticeSubmission
} from '../../model/types'
import { practiseService } from '../../api/practise.service'
// const reviewFormSchema = z.object({
//   scores: z.record(z.string(), z.number().min(1).max(5)),
//   comment: z.string().min(5, 'Комментарий обязателен')
// })

// type ReviewFormValues = z.infer<typeof reviewFormSchema>
type PractiseSubmissionFormValues = z.infer<typeof formSchema>
const formSchema = z.object({
  githubRepo: z.string().url({ message: 'Некорректный URL репозитория' }),
  githubPagesUrl: z.string().url({ message: 'Некорректный URL GitHub Pages' }),
  challenges: z.string(),
  learned: z.string()
})
interface PractiseSubmissionFormProps {
  practise: StandalonePractice
  onSubmissionSuccess: (
    practiseSubmission: StandalonePracticeSubmission
  ) => void
}
export const PractiseSubmissionForm = ({
  practise,
  onSubmissionSuccess
}: PractiseSubmissionFormProps) => {
  const { user } = useUser()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      githubRepo: '',
      githubPagesUrl: '',
      challenges: '',
      learned: ''
    }
  })
  const handleSubmit = async (values: PractiseSubmissionFormValues) => {
    console.log('Form values:', values)
    if (!user || !practise) return

    try {
      const practiseSubmition = await practiseService.submitPractice(
        practise.id,
        {
          userId: user.id,
          practiceId: practise.id,
          ...values
        }
      )
      console.log('Submission response:', practiseSubmition)
      onSubmissionSuccess(practiseSubmition)
      // const newTargetReviewsIds = await reviewService.setTargetReviews(
      //   user.id,
      //   practiseSubmition.id
      // )

      // setTargetReviewsIds(newTargetReviewsIds)
      //   console.log('Target Reviews:', newTargetReviewsIds)
      // setSubmissionExists(true)

      toast.success('Решение успешно сохранено!')
    } catch (error) {
      toast.error('Ошибка при отправке решения')
      console.error('Submit error:', error)
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 mt-10"
      >
        {/* <iframe
          src="https://hamptooon.github.io/testBuildCrazyMan/"
          className="w-full h-180 border-0 "
          scrolling="no"
          allowFullScreen
        ></iframe> */}
        <FormField
          control={form.control}
          name="githubPagesUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на GitHub Pages</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://username.github.io/project"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="githubRepo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на GitHub репозиторий *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://github.com/username/project"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="challenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>С какими сложностями столкнулись?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Опишите возникшие сложности..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="learned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Что нового узнали и чему научились?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Опишите полученные знания и навыки..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Отправить на проверку
        </Button>
      </form>
    </Form>
  )
}
