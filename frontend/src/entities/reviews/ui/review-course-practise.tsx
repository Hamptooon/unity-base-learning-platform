'use client'
import { ReviewCriteria } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/shared/ui/form'
import { Slider } from '@/shared/ui/slider'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { reviewService } from '@/features/admin/course/api/review.service'
import { toast } from 'react-toastify'
import { Card, CardContent } from '@/shared/ui/card'
import { useEffect, useState } from 'react'
import { aiService } from '@/entities/ai/api/ai.service'
import { Progress } from '@/shared/ui/progress'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { useUser } from '@/features/auth/provider/user-provider'
const reviewFormSchema = z.object({
  scores: z.record(z.string(), z.number().min(1).max(5)),
  comment: z.string().min(5, 'Комментарий обязателен')
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

interface ReviewSubmissionFormProps {
  submission: PracticeSubmission
  reviewCriterias: ReviewCriteria[]
}

export function ReviewCoursePractiseSubmissionForm({
  submission,
  reviewCriterias
}: ReviewSubmissionFormProps) {
  const { user } = useUser()
  const [aiCheckResult, setAiCheckResult] = useState<{
    score: number
    explanation: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false) // новый стейт загрузки AI
  const [isCorrectReview, setIsCorrectReview] = useState(false)
  const [dotCount, setDotCount] = useState(1)
  const [progressValue, setProgressValue] = useState(0)
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      scores: reviewCriterias.reduce(
        (acc, criteria) => ({
          ...acc,
          [criteria.id]: 3
        }),
        {}
      ),
      comment: ''
    }
  })
  useEffect(() => {
    if (isChecking) {
      const dotsInterval = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1)
      }, 500)

      const progressInterval = setInterval(() => {
        setProgressValue(prev => (prev >= 100 ? 0 : prev + 10))
      }, 300)

      return () => {
        clearInterval(dotsInterval)
        clearInterval(progressInterval)
      }
    }
  }, [isChecking])
  useEffect(() => {
    form.reset({
      scores: reviewCriterias.reduce(
        (acc, criteria) => ({
          ...acc,
          [criteria.id]: 3
        }),
        {}
      ),
      comment: ''
    })
    setAiCheckResult(null) // сброс результата AI при смене ревью или критериев
  }, [reviewCriterias, submission.id])
  const handleCheckReview = async () => {
    try {
      setIsChecking(true) // включаем загрузку
      const aiResult = await aiService.aiCommentCheck({
        comment: form.getValues('comment')
      })
      setAiCheckResult(aiResult)
      setIsChecking(false) // выключаем загрузку

      if (aiResult.score > 70) {
        toast.error(`Комментарий не прошел проверку AI`)
        return
      } else {
        setIsCorrectReview(true)
        toast.success('Комментарий прошел проверку AI')
      }
    } catch (error) {
      toast.error('Ошибка при проверке комментария AI')
      console.error('AI check error:', error)
    }
  }
  const handleSubmit = async (values: ReviewFormValues) => {
    try {
      // setIsChecking(true) // включаем загрузку
      // const aiResult = await aiService.aiCommentCheck({
      //   comment: values.comment
      // })
      // setAiCheckResult(aiResult)
      // setIsChecking(false) // выключаем загрузку

      // if (aiResult.score > 70) {
      //   toast.error(`Комментарий не прошел проверку AI`)
      //   return
      // } else {
      //   return
      // }

      const formattedScores = Object.entries(values.scores).map(
        ([criteriaId, score]) => ({
          criteriaId,
          score: Math.round(score) // гарантия целого числа
        })
      )

      const payload = {
        reviewerSubmissionId: null,
        comment: values.comment,
        scores: formattedScores
      }

      await reviewService.reviewSubmissionWithoutReviewerSubmission(
        submission.id,
        user.id,
        payload
      )

      toast.success('Проверка успешно отправлена!')
    } catch (error) {
      toast.error('Ошибка при отправке проверки')
      console.error('Review submission error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="mt-4">
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Репозиторий:</p>
            <a
              href={submission.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {submission.githubRepo}
            </a>
          </div>

          {submission.learned && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Что изучил автор:
              </p>
              <p>{submission.learned}</p>
            </div>
          )}

          {submission.challenges && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Сложности:</p>
              <p>{submission.challenges}</p>
            </div>
          )}
          <iframe
            src={submission.githubPagesUrl}
            title="Build Game"
            className="w-full h-180 border-0 "
            scrolling="no"
            allowFullScreen
          ></iframe>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {reviewCriterias.map(criteria => (
                <FormField
                  key={criteria.id}
                  control={form.control}
                  name={`scores.${criteria.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{criteria.title}</FormLabel>
                      <FormControl>
                        <div>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={val => field.onChange(val[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <span key={n} className="w-4 text-center">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {criteria.description}
                      </p>
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий</FormLabel>
                    <FormControl>
                      {isChecking ? (
                        <div className="relative">
                          <Skeleton className="h-24 w-full rounded-md flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                AI проверка
                              </span>
                              <div className="flex space-x-1">
                                {Array.from({ length: dotCount }).map(
                                  (_, i) => (
                                    <span
                                      key={i}
                                      className="w-1 h-1 bg-foreground rounded-full animate-pulse"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </Skeleton>
                          <Progress
                            value={progressValue}
                            className="h-1.5 mt-2 bg-background rounded-full animate-pulse"
                          />
                        </div>
                      ) : (
                        <Textarea
                          placeholder="Введите развернутый комментарий..."
                          {...field}
                          disabled={isChecking}
                          className="resize-none min-h-[150px]"
                        />
                      )}
                    </FormControl>

                    {aiCheckResult && (
                      <div className="mt-3 space-y-2">
                        <Badge
                          variant="outline"
                          className={`flex items-center w-fit space-x-1.5 ${
                            aiCheckResult.score > 70
                              ? 'border-red-600/30 bg-red-500/10 text-red-600'
                              : 'border-green-600/30 bg-green-500/10 text-green-600'
                          }`}
                        >
                          <span>🤖</span>
                          <span>AI Анализ</span>
                        </Badge>
                        <p
                          className={`text-sm leading-none${
                            aiCheckResult.score > 70
                              ? ' text-red-500'
                              : ' text-green-400'
                          }`}
                        >
                          {aiCheckResult.explanation}
                        </p>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              {isCorrectReview ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  Отправить ревью
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCheckReview}
                >
                  Проверить ревью
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
