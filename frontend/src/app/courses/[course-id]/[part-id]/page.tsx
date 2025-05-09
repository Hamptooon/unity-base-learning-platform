'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CoursePart,
  CoursePartType,
  CoursePractice,
  ReviewCriteria
} from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { useUser } from '@/features/auth/provider/user-provider'
import { toast } from 'react-toastify'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewService } from '@/features/admin/course/api/review.service'
import { PracticeSubmission } from '@/entities/user/model/types'
import { set, z } from 'zod'
import { Slider } from '@/shared/ui/slider'
const reviewFormSchema = z.object({
  scores: z.record(z.string(), z.number().min(1).max(5)),
  comment: z.string().min(5, 'Комментарий обязателен')
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>
const formSchema = z.object({
  githubRepo: z.string().url({ message: 'Некорректный URL репозитория' }),
  challenges: z.string().optional(),
  learned: z.string().optional()
})

export default function CoursePartPage() {
  const { 'part-id': partId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [part, setPart] = useState<CoursePart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nextPart, setNextPart] = useState<CoursePart | null>(null)
  const [submissionExists, setSubmissionExists] = useState(false)
  const [targetReviewsIds, setTargetReviewsIds] = useState<string[]>([])
  const [currentReviewSubmition, setCurrentReviewSubmition] =
    useState<PracticeSubmission | null>(null)
  const [reviewCriterias, setReviewCriterias] = useState<ReviewCriteria[]>([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({})
  const [isAllReviewed, setIsAllReviewed] = useState(false)
  const [initialTargetCount, setInitialTargetCount] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      githubRepo: '',
      challenges: '',
      learned: ''
    }
  })
  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      scores: {},
      comment: ''
    }
  })
  useEffect(() => {
    const fetchData = async () => {
      try {
        const partData = await courseService.getCoursePart(partId as string)
        setPart(partData)

        const courseData = await courseService.getCourseInfo(partData.courseId)
        const sortedParts = courseData.parts.sort(
          (a, b) => a.sortOrder - b.sortOrder
        )

        const currentIndex = sortedParts.findIndex(p => p.id === partData.id)
        if (currentIndex < sortedParts.length - 1) {
          setNextPart(sortedParts[currentIndex + 1])
        }

        // Проверяем наличие существующей заявки
        if (user && partData.type === CoursePartType.PRACTICAL) {
          const submission = await courseService.getSubmission(
            user.id,
            partData.id
          )
          setSubmissionExists(!!submission)
          setTargetReviewsIds(submission?.reviewsTargets || [])
          setInitialTargetCount(submission?.reviewsTargets.length || 0)
          console.log('target:', submission?.reviewsTargets)
          console.log('target1:', targetReviewsIds)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [partId, user])
  useEffect(() => {
    const processReviews = async () => {
      if (!user || targetReviewsIds.length === 0) {
        // setIsAllReviewed(true)
        return
      }

      // Получаем следующее решение для проверки
      const [nextReviewId, ...remaining] = targetReviewsIds

      try {
        const submissionToReview = await reviewService.getSubmissionById(
          nextReviewId
        )
        console.log('Submission to review:', submissionToReview)
        const reviewsCriterias = await reviewService.getReviewCriteriasByPartId(
          submissionToReview.partId
        )
        setCurrentReviewIndex(targetReviewsIds.length - remaining.length)
        setReviewCriterias(reviewsCriterias)
        console.log('Reviews Criterias:', reviewsCriterias)
        setCurrentReviewSubmition(submissionToReview)
        setTargetReviewsIds(remaining)
      } catch (error) {
        console.error('Ошибка при получении решения для проверки:', error)
      }
    }
    if (part?.type === CoursePartType.PRACTICAL) {
      processReviews()
    }
  }, [targetReviewsIds, user])
  // useEffect(() => {
  //   const handlePeerReview = async () => {
  //     const unreviewedSubmissions =
  //       await reviewService.getUnreviewedSubmissions(user.id)
  //     console.log('Unreviewed Submissions:', unreviewedSubmissions)
  //   }
  //   if (submissionExists) {
  //     handlePeerReview()
  //   }
  // }, [submissionExists])
  // useEffect(() => {
  //   if (isAllReviewed && submissionExists) {
  //     toast.success('Вы проверили все решения!')
  //     toast.success('Ваше решение отправлено на проверку!')
  //     setCurrentReviewSubmition(null)
  //     setCurrentReviewIndex(0)
  //   }
  // }, [isAllReviewed, submissionExists, targetReviewsIds])
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !part) return

    try {
      const practiseSubmition = await courseService.submitPractice({
        userId: user.id,
        partId: part.id,
        ...values
      })
      const newTargetReviewsIds = await reviewService.setTargetReviews(
        user.id,
        practiseSubmition.id
      )

      setTargetReviewsIds(newTargetReviewsIds)
      console.log('Target Reviews:', newTargetReviewsIds)
      setSubmissionExists(true)
      toast.success('Решение успешно сохранено!')
    } catch (error) {
      toast.error('Ошибка при отправке решения')
      console.error('Submit error:', error)
    }
  }

  const handleSubmitReview = async (values: ReviewFormValues) => {
    if (!user || !currentReviewSubmition) {
      console.log('addsdadsa')
      return
    }

    try {
      // await reviewService.reviewSubmission(currentReviewSubmition.id, values)
      toast.success('Решение успешно оценено!')
      setCurrentReviewSubmition(null)
      setCurrentReviewIndex(currentReviewIndex + 1)
    } catch (error) {
      toast.error('Ошибка при отправке ревью')
      console.error('Submit review error:', error)
    }
  }
  const handleNextPart = async () => {
    if (!user || !part) return

    try {
      if (part.type === CoursePartType.PRACTICAL && !submissionExists) {
        throw new Error('Необходимо отправить решение')
      }

      await courseService.completePart(user.id, part.courseId, part.id)

      if (nextPart) {
        router.push(`/courses/${part.courseId}/${nextPart.id}`)
      } else {
        router.push(`/courses/${part.courseId}`)
        toast.success('Курс успешно завершен!')
      }
    } catch (error) {
      toast.error('Ошибка при переходе к следующей части')
      console.error('Next part error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!part) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Часть не найдена</h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/courses/${part.courseId}`)}
        >
          ← Назад к курсу
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="outline"
        onClick={() => router.push(`/courses/${part.courseId}`)}
        className="mb-6"
      >
        ← Назад к курсу
      </Button>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">{part.title}</CardTitle>
            <Badge variant="outline">
              {part.type === CoursePartType.THEORETICAL ? 'Theory' : 'Practice'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {part.previewImageUrl && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_STATIC_URL}${part.previewImageUrl}`}
              alt={part.title}
              className="w-full h-64 object-cover rounded-lg bg-muted mb-6"
            />
          )}

          <p className="text-lg text-muted-foreground mb-6">
            {part.description}
          </p>

          {part.type === CoursePartType.THEORETICAL && part.article && (
            <div className="prose max-w-none">
              <h3 className="text-2xl font-bold mb-4">Article Content</h3>
              <div dangerouslySetInnerHTML={{ __html: part.article.content }} />
            </div>
          )}
          {part.type === CoursePartType.PRACTICAL && part.practice && (
            <div className="prose max-w-none">
              <h3 className="text-2xl font-bold mb-4">Practice Content</h3>
              <div
                dangerouslySetInnerHTML={{ __html: part.practice.content }}
              />
            </div>
          )}

          {part.type === CoursePartType.PRACTICAL && part.practice && (
            <>
              <div className="border rounded-lg p-6 bg-muted/50">
                <h3 className="text-2xl font-bold mb-4">
                  Ассеты для использования в проекте
                </h3>
                <Button className="cursor-pointer" type="button">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/files/${part.practice.assetsFileUrl}`}
                  >
                    Скачать
                  </a>
                </Button>
              </div>
              {submissionExists ? (
                <>
                  {!isAllReviewed ? (
                    <div className="text-center py-6">
                      <h3 className="text-xl font-bold mb-4">
                        Решение сохранено
                      </h3>
                      <p className="text-muted-foreground">
                        Оно отправится на проверку, после того как вы проверите
                        2 ух других пользователей
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <h3 className="text-xl font-bold mb-4">
                        Решение на проверке
                      </h3>
                      <p className="text-muted-foreground">
                        Мы пришлем уведомление, когда ваше решение будет
                        проверено по крайней мере двумя пользователями, и вы
                        сможете перейти к следующему этапу курса.
                      </p>
                    </div>
                  )}

                  {currentReviewSubmition && (
                    <>
                      <h3 className="text-xl font-semibold mb-2">
                        Проверка {currentReviewIndex} из {initialTargetCount}
                      </h3>
                      <Card className="mt-8">
                        <CardHeader></CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Репозиторий:
                            </p>
                            <a
                              href={currentReviewSubmition.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {currentReviewSubmition.githubRepo}
                            </a>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Что изучил автор:
                            </p>
                            <p>
                              {currentReviewSubmition.learned || 'Не указано'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Сложности:
                            </p>
                            <p>
                              {currentReviewSubmition.challenges ||
                                'Не указано'}
                            </p>
                          </div>

                          {/* Оценивание по критериям */}
                          {part?.coursePracticeTaskId && (
                            <>
                              <h3 className="text-xl font-semibold">
                                Оценка по критериям
                              </h3>
                              <Form {...reviewForm}>
                                <form
                                  onSubmit={reviewForm.handleSubmit(
                                    handleSubmitReview
                                  )}
                                  className="space-y-6"
                                >
                                  {reviewCriterias?.map(criteria => (
                                    <FormField
                                      key={criteria.id}
                                      control={reviewForm.control}
                                      name={`scores.${criteria.id}` as const}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            {criteria.title}
                                          </FormLabel>
                                          <FormControl>
                                            <Slider
                                              min={1}
                                              max={5}
                                              step={1}
                                              value={[field.value ?? 3]}
                                              onValueChange={val =>
                                                field.onChange(val[0])
                                              }
                                            />
                                          </FormControl>
                                          <p className="text-sm text-muted-foreground">
                                            {criteria.description}
                                          </p>
                                        </FormItem>
                                      )}
                                    />
                                  ))}

                                  <FormField
                                    control={reviewForm.control}
                                    name="comment"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Комментарий</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Введите комментарий к проверке"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <Button type="submit" className="w-full">
                                    Отправить ревью
                                  </Button>
                                </form>
                              </Form>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6 mt-10"
                  >
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
                          <FormLabel>
                            С какими сложностями столкнулись?
                          </FormLabel>
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
                          <FormLabel>
                            Что нового узнали и чему научились?
                          </FormLabel>
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
              )}
            </>
          )}
        </CardContent>
      </Card>
      {user && part.type !== CoursePartType.PRACTICAL && (
        <Button type="button" className="w-full mt-5" onClick={handleNextPart}>
          {nextPart ? 'Следующая часть' : 'Завершить курс'}
        </Button>
      )}
    </div>
  )
}
