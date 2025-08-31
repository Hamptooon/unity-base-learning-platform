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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Star, Download } from 'lucide-react'
import ComplaintReviewDialog from '@/features/complaint-review/ui/complaint-review-dialog'
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
import { PractiseSubmissionForm } from '@/features/practise-submission/ui/practise-submission-form'
import { ReviewSubmissionForm } from '@/features/review-submission/ui/review-submission-form'
import '@blocknote/core/style.css'
import '@blocknote/react/style.css'
import { ReviewsInfo } from '@/entities/course/model/types'
import { BlockNoteRenderer } from '@/shared/ui/block-note-renderer'
import { practiseSolutionService } from '@/entities/practise-solution/api/practise-solution.service'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { LuMonitorPlay } from 'react-icons/lu'
import { FiAlertTriangle } from 'react-icons/fi'
import { FaRegLightbulb } from 'react-icons/fa'
import { Calendar } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FaRegCheckCircle } from 'react-icons/fa'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'

const reviewFormSchema = z.object({
  scores: z.record(z.string(), z.number().min(1).max(5)),
  comment: z.string().min(5, 'Комментарий обязателен')
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

export default function CoursePartPage() {
  const { 'part-id': partId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [part, setPart] = useState<CoursePart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nextPart, setNextPart] = useState<CoursePart | null>(null)
  // const [submissionExists, setSubmissionExists] = useState(false)
  const [practiseSubmission, setPractiseSubmission] =
    useState<PracticeSubmission | null>(null)
  // const [targetReviewsIds, setTargetReviewsIds] = useState<string[]>([])
  // const [currentReviewSubmition, setCurrentReviewSubmition] =
  // useState<PracticeSubmission | null>(null)
  const [currentReviewCriterias, setcurrentReviewCriterias] = useState<
    ReviewCriteria[]
  >([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  // const [reviewScores, setReviewScores] = useState<Record<string, number>>({})
  const [isAllReviewed, setIsAllReviewed] = useState(false)
  // const [initialTargetCount, setInitialTargetCount] = useState(0)
  const [submissionsToReview, setSubmissionsToReview] = useState<
    PracticeSubmission[]
  >([])
  const [reviewsInfo, setReviewsInfo] = useState<ReviewsInfo[] | null>(null)
  // const reviewForm = useForm<ReviewFormValues>({
  //   resolver: zodResolver(reviewFormSchema),
  //   defaultValues: {
  //     scores: {},
  //     comment: ''
  //   }
  // })
  useEffect(() => {
    const fetchData = async () => {
      try {
        const partData = await courseService.getCoursePart(partId as string)
        setPart(partData)
        if (partData.type === CoursePartType.THEORETICAL) {
          setIsAllReviewed(true)
        }
        const courseData = await courseService.getCourseInfo(partData.courseId)
        const sortedParts = courseData.parts.sort(
          (a, b) => a.sortOrder - b.sortOrder
        )

        const currentIndex = sortedParts.findIndex(p => p.id === partData.id)
        if (currentIndex < sortedParts.length - 1) {
          setNextPart(sortedParts[currentIndex + 1])
        }

        // Проверяем наличие существующего решения
        if (user && partData.type === CoursePartType.PRACTICAL) {
          const submission = await courseService.getSubmission(
            user.id,
            partData.id
          )
          // setSubmissionExists(!!submission)
          setPractiseSubmission(submission)
          if (submission && !submission.canReviewed) {
            const submissionsToReviewData =
              await reviewService.getSubmissionsToReview(submission.id)
            if (submissionsToReviewData.length > 0) {
              setSubmissionsToReview(submissionsToReviewData)
              const reviewCriterias =
                await reviewService.getReviewCriteriasByPartId(
                  submissionsToReviewData[currentReviewIndex].partId
                )
              setcurrentReviewCriterias(reviewCriterias)
            } else {
              setIsAllReviewed(true)
            }
          }
          if (submission && submission.canReviewed) {
            const reviewsInfo =
              await practiseSolutionService.getReviewsBySolutionId(
                submission.id
              )
            setReviewsInfo(reviewsInfo)
            setIsAllReviewed(true)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [partId, user])

  const handleReviewComplete = async (isAllReviewed: boolean) => {
    setIsAllReviewed(isAllReviewed)
    if (currentReviewIndex + 1 < submissionsToReview.length) {
      const reviewCriterias = await reviewService.getReviewCriteriasByPartId(
        submissionsToReview[currentReviewIndex + 1].partId
      )
      console.log('Review Criterias1111:', reviewCriterias)
      setcurrentReviewCriterias(reviewCriterias)
      setCurrentReviewIndex(prev => prev + 1)
    } else {
      try {
        if (user && part) {
          // await reviewService.markReviewsCompleted(user.id, part.id)
          setSubmissionsToReview([])
          // setSubmissionExists(true)
          toast.success(
            'Все проверки завершены! Теперь вы можете перейти к следующей части.'
          )
        }
      } catch (error) {
        toast.error('Ошибка при завершении проверок')
      }
    }
  }

  const handlePractiseSubmition = async (
    practiseSubmission: PracticeSubmission
  ) => {
    setPractiseSubmission(practiseSubmission)
    if (practiseSubmission && !practiseSubmission.canReviewed) {
      const submissionsToReviewData =
        await reviewService.getSubmissionsToReview(practiseSubmission.id)
      if (submissionsToReviewData.length > 0) {
        setSubmissionsToReview(submissionsToReviewData)
        const reviewCriterias = await reviewService.getReviewCriteriasByPartId(
          submissionsToReviewData[currentReviewIndex].partId
        )
        setcurrentReviewCriterias(reviewCriterias)
      } else {
        setIsAllReviewed(true)
      }
    }
    if (practiseSubmission && practiseSubmission.canReviewed) {
      setIsAllReviewed(true)
    }
  }

  const handleNextPart = async () => {
    if (!user || !part) return

    try {
      if (part.type === CoursePartType.PRACTICAL && !practiseSubmission) {
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

  if (isLoading || !part) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-[400px]" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Вкладки */}
        <div className="flex space-x-4 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Контент */}
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />

          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // if (!part) {
  //   return (
  //     <div className="max-w-4xl mx-auto px-4 py-8 text-center">
  //       <h2 className="text-2xl font-bold mb-4">Часть не найдена</h2>
  //       <Button
  //         variant="outline"
  //         onClick={() => router.push(`/courses/${part.courseId}`)}
  //       >
  //         ← Назад к курсу
  //       </Button>
  //     </div>
  //   )
  // }
  const averageScore = reviewsInfo
    ? reviewsInfo.reduce((acc, review) => acc + review.score, 0) /
      reviewsInfo.length
    : 0
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${part.courseId}`)}
            className="mb-6"
          >
            ← Назад к курсу
          </Button>
          {part.type === CoursePartType.PRACTICAL && (
            <div className="flex items-center mt-2">
              <div className="flex items-center bg-neutral-950 px-3 py-2 rounded">
                {averageScore ? (
                  <>
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold text-lg">
                      {averageScore.toFixed(1)}
                    </span>
                    <span className="text-white/70 ml-1">/ 5.0</span>
                  </>
                ) : (
                  <p>Не проверено</p>
                )}
              </div>
              <span className="ml-4 text-muted-foreground">
                {reviewsInfo ? reviewsInfo?.length : 0} reviews
              </span>
            </div>
          )}
        </div>
      </div>
      {part.type === CoursePartType.PRACTICAL && (
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="solution">Решение</TabsTrigger>
            <TabsTrigger value="reviews">
              Ревью ({reviewsInfo ? reviewsInfo.length : 0})
            </TabsTrigger>
          </TabsList>

          {/* Контент: Описание */}
          <TabsContent value="description" className="mt-6 space-y-6 max-w-7xl">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <img
                src={
                  part.previewImageUrl
                    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${part.previewImageUrl}`
                    : '/placeholder-course.png'
                }
                alt={part.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex items-center gap-4 justify-between">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/files/${part.practice.assetsFileUrl}`}
                  download
                >
                  Скачать материалы
                </a>
              </Button>
            </div>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold">{part.title}</h2>
              <p className="text-muted-foreground mt-2">{part.description}</p>

              <div className="prose max-w-none">
                <BlockNoteRenderer content={part.practice.content} />
              </div>
            </div>
          </TabsContent>

          {/* Контент: Решение */}
          <TabsContent value="solution" className="mt-6 space-y-6 max-w-7xl">
            {practiseSubmission && submissionsToReview.length > 0 && (
              <ReviewSubmissionForm
                submission={submissionsToReview[currentReviewIndex]}
                reviewerSubmissionId={practiseSubmission.id}
                reviewCriterias={currentReviewCriterias}
                currentReview={currentReviewIndex + 1}
                totalReviews={submissionsToReview.length}
                onReviewComplete={handleReviewComplete}
              />
            )}

            {!practiseSubmission && submissionsToReview.length == 0 && (
              <PractiseSubmissionForm
                coursePart={part}
                onSubmissionSuccess={handlePractiseSubmition}
              />
            )}
            {practiseSubmission && submissionsToReview.length === 0 && (
              <div className="mt-10 max-w-7xl mx-auto">
                {/* Статус отправки */}
                <div className="mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border">
                  <div className="w-8 h-8 rounded-full  flex items-center justify-center">
                    <FaRegCheckCircle className="h-5 w-5 " />
                  </div>
                  <p className=" font-medium">
                    Ваше решение успешно отправлено на проверку
                  </p>
                </div>

                {/* Основная карточка */}
                <div className="rounded-xl shadow-md overflow-hidden border ">
                  {/* Заголовок секции */}
                  <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <LuMonitorPlay className="w-6 h-6" />
                      Превью вашего проекта
                    </h2>
                    <p className=" mt-1">
                      Просмотрите свою работу и отправленные материалы
                    </p>
                  </div>

                  {/* Iframe для превью проекта */}
                  <div className="p-6 ">
                    <div className="relative">
                      <div className="absolute -top-3 left-4 px-2 py-0.5 text-xs font-medium text-gray-500 border rounded-md">
                        Live Preview
                      </div>
                      <iframe
                        src={practiseSubmission.githubPagesUrl}
                        className="w-full h-170 rounded-lg border-2  shadow-sm"
                        title="Project Preview"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Детали отправки */}
                  <div className="p-6 grid gap-8 md:grid-cols-2">
                    {/* Левая колонка */}
                    <div className="space-y-6">
                      {/* GitHub репозиторий */}
                      <div className="group">
                        <h3 className="font-semibold flex items-center gap-2  mb-2">
                          <FaGithub className="w-5 h-5 " />
                          GitHub репозиторий
                        </h3>
                        <div className="flex items-center  rounded-lg p-3 border hover:border-indigo-300 transition-colors">
                          <a
                            href={practiseSubmission.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium break-words flex-1"
                          >
                            {practiseSubmission.githubRepo}
                          </a>
                          <a
                            href={practiseSubmission.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2   p-2 rounded-md transition-colors"
                          >
                            <FaExternalLinkAlt className="w-4 h-4 " />
                          </a>
                        </div>
                      </div>

                      {/* Дата отправки */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 " />
                          Дата отправки
                        </h3>
                        <div className=" rounded-lg p-3 border ">
                          <p className="">
                            {practiseSubmission.createdAt
                              ? new Date(
                                  practiseSubmission.createdAt
                                ).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Правая колонка */}
                    <div className="space-y-6">
                      {/* Сложности */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <FiAlertTriangle className="w-4 h-4 text-amber-500" />
                          Сложности при выполнении
                        </h3>
                        <div className=" rounded-lg p-3 border  min-h-20">
                          <p className=" whitespace-pre-line">
                            {practiseSubmission.challenges || 'Не указано'}
                          </p>
                        </div>
                      </div>

                      {/* Что изучено */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2  mb-2">
                          <FaRegLightbulb className="w-4 h-4 text-yellow-500" />
                          Что было изучено
                        </h3>
                        <div className=" rounded-lg p-3 border  min-h-20">
                          <p className=" whitespace-pre-line">
                            {practiseSubmission.learned || 'Не указано'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Нижняя панель */}
                  <div className=" p-4 border-t  flex justify-end">
                    <button
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                      onClick={() =>
                        window.open(practiseSubmission.githubPagesUrl, '_blank')
                      }
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                      Открыть проект в новой вкладке
                    </button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Контент: Ревью */}
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {!reviewsInfo ? (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Нет ревью</p>
                  <p className="text-sm">
                    Ревью будет доступно после проверки задания
                  </p>
                </div>
              ) : (
                reviewsInfo.map(review => (
                  <div key={review.id} className="border rounded-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer.avatarUrl} />
                          <AvatarFallback>
                            {review.reviewer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {review.reviewer.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg w-fit">
                        {review.score}/5
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {review.reviewPractiseScoreCriterias.map(criteria => (
                        <div
                          key={criteria.id}
                          className="pl-4 border-l-4 border-primary"
                        >
                          <h5 className="font-medium">
                            {criteria.reviewCriteriaTitle}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {criteria.reviewCriteriaDescription}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-medium">Оценка:</span>
                            <Badge variant="secondary">
                              {criteria.score}/5
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {review.comment && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg mb-5">
                        <h5 className="font-medium mb-2">Комментарий</h5>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    <ComplaintReviewDialog
                      reviewId={review.id}
                      reviewedUserId={practiseSubmission?.userId}
                      reviewerUserId={review.reviewer.userId}
                      // onComplaintReview={handleComplaintReview}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      {part.type === CoursePartType.THEORETICAL && (
        <article className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <img
            src={
              part.previewImageUrl
                ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${part.previewImageUrl}`
                : '/placeholder-course.png'
            }
            alt={`Превью: ${part.title}`}
            className="w-full rounded-lg object-cover max-h-96"
          />
          <div className="flex flex-wrap gap-2">
            {/* {article.tags?.map(tag => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))} */}
          </div>
          <h1 className="text-4xl font-extrabold">{part.title}</h1>

          <p className="text-lg text-gray-700">{part.description}</p>

          <div className="prose max-w-none">
            <BlockNoteRenderer content={part.article.content} />
          </div>

          {/* <p className="text-sm text-gray-400">
            Опубликовано: {new Date(part.article.createdAt).toLocaleDateString()}
          </p> */}
        </article>
      )}
      {/* <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">{part.title}</CardTitle>
            <Badge variant="outline">
              {part.type === CoursePartType.THEORETICAL ? 'Теория' : 'Практика'}
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

          {part.type === CoursePartType.THEORETICAL &&
            part.article &&
            part.article.content && (
              <div className="prose max-w-none">
                <BlockNoteRenderer content={part.article.content} />
              </div>
            )}
          {part.type === CoursePartType.PRACTICAL &&
            part.practice &&
            part.practice.content && (
              <div className="prose max-w-none">
                <BlockNoteRenderer content={part.practice.content} />
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
              {practiseSubmission ? (
                <div className="mt-8">
                  {submissionsToReview.length > 0 ? (
                    <ReviewSubmissionForm
                      submission={submissionsToReview[currentReviewIndex]}
                      reviewerSubmissionId={practiseSubmission.id}
                      reviewCriterias={currentReviewCriterias}
                      currentReview={currentReviewIndex + 1}
                      totalReviews={submissionsToReview.length}
                      onReviewComplete={handleReviewComplete}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <h3 className="text-xl font-bold mb-4">
                        {practiseSubmission.canReviewed
                          ? 'Решение на проверке'
                          : 'Ожидайте проверки вашего решения'}
                      </h3>
                      <p className="text-muted-foreground">
                        {practiseSubmission.canReviewed &&
                          'Ваше решение будет проверено другими участниками. Вы получите уведомление по завершении проверки.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <PractiseSubmissionForm
                  coursePart={part}
                  onSubmissionSuccess={handlePractiseSubmition}
                />
              )}
            </>
          )}
        </CardContent>
      </Card> */}
      {user && isAllReviewed && (
        <Button type="button" className="w-full mt-5" onClick={handleNextPart}>
          {nextPart ? 'Следующая часть' : 'Завершить курс'}
        </Button>
      )}
    </div>
  )
}

///////////
// 'use client'
// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import {
//   CoursePart,
//   CoursePartType,
//   CoursePractice,
//   ReviewCriteria
// } from '@/entities/course/model/types'
// import { courseService } from '@/entities/course/api/course.service'
// import { Button } from '@/shared/ui/button'
// import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
// import { useUser } from '@/features/auth/provider/user-provider'
// import { toast } from 'react-toastify'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/shared/ui/form'
// import { Badge } from '@/shared/ui/badge'
// import { Skeleton } from '@/shared/ui/skeleton'
// import { Input } from '@/shared/ui/input'
// import { Textarea } from '@/shared/ui/textarea'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { reviewService } from '@/features/admin/course/api/review.service'
// import { PracticeSubmission } from '@/entities/user/model/types'
// import { set, z } from 'zod'
// import { Slider } from '@/shared/ui/slider'
// import { PractiseSubmissionForm } from '@/features/practise-submission/ui/practise-submission-form'
// import { ReviewSubmissionForm } from '@/features/review-submission/ui/review-submission-form'
// import '@blocknote/core/style.css'
// import '@blocknote/react/style.css'
// import { ReviewsInfo } from '@/entities/course/model/types'
// import { BlockNoteRenderer } from '@/shared/ui/block-note-renderer'
// import { practiseSolutionService } from '@/entities/practise-solution/api/practise-solution.service'
// const reviewFormSchema = z.object({
//   scores: z.record(z.string(), z.number().min(1).max(5)),
//   comment: z.string().min(5, 'Комментарий обязателен')
// })

// type ReviewFormValues = z.infer<typeof reviewFormSchema>

// export default function CoursePartPage() {
//   const { 'part-id': partId } = useParams()
//   const router = useRouter()
//   const { user } = useUser()
//   const [part, setPart] = useState<CoursePart | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [nextPart, setNextPart] = useState<CoursePart | null>(null)
//   // const [submissionExists, setSubmissionExists] = useState(false)
//   const [practiseSubmission, setPractiseSubmission] =
//     useState<PracticeSubmission | null>(null)
//   // const [targetReviewsIds, setTargetReviewsIds] = useState<string[]>([])
//   // const [currentReviewSubmition, setCurrentReviewSubmition] =
//   // useState<PracticeSubmission | null>(null)
//   const [currentReviewCriterias, setcurrentReviewCriterias] = useState<
//     ReviewCriteria[]
//   >([])
//   const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
//   // const [reviewScores, setReviewScores] = useState<Record<string, number>>({})
//   const [isAllReviewed, setIsAllReviewed] = useState(false)
//   // const [initialTargetCount, setInitialTargetCount] = useState(0)
//   const [submissionsToReview, setSubmissionsToReview] = useState<
//     PracticeSubmission[]
//   >([])
//   const [reviewsInfo, setReviewsInfo] = useState<ReviewsInfo[] | null>(null)
//   // const reviewForm = useForm<ReviewFormValues>({
//   //   resolver: zodResolver(reviewFormSchema),
//   //   defaultValues: {
//   //     scores: {},
//   //     comment: ''
//   //   }
//   // })
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const partData = await courseService.getCoursePart(partId as string)
//         setPart(partData)
//         if (partData.type === CoursePartType.THEORETICAL) {
//           setIsAllReviewed(true)
//         }
//         const courseData = await courseService.getCourseInfo(partData.courseId)
//         const sortedParts = courseData.parts.sort(
//           (a, b) => a.sortOrder - b.sortOrder
//         )

//         const currentIndex = sortedParts.findIndex(p => p.id === partData.id)
//         if (currentIndex < sortedParts.length - 1) {
//           setNextPart(sortedParts[currentIndex + 1])
//         }

//         // Проверяем наличие существующего решения
//         if (user && partData.type === CoursePartType.PRACTICAL) {
//           const submission = await courseService.getSubmission(
//             user.id,
//             partData.id
//           )
//           // setSubmissionExists(!!submission)
//           setPractiseSubmission(submission)
//           if (submission && !submission.canReviewed) {
//             const submissionsToReviewData =
//               await reviewService.getSubmissionsToReview(submission.id)
//             if (submissionsToReviewData.length > 0) {
//               setSubmissionsToReview(submissionsToReviewData)
//               const reviewCriterias =
//                 await reviewService.getReviewCriteriasByPartId(
//                   submissionsToReviewData[currentReviewIndex].partId
//                 )
//               setcurrentReviewCriterias(reviewCriterias)
//             } else {
//               setIsAllReviewed(true)
//             }
//           }
//           if (submission && submission.canReviewed) {
//             const reviewsInfo =
//               await practiseSolutionService.getReviewsBySolutionId(
//                 submission.id
//               )
//             setReviewsInfo(reviewsInfo)
//             setIsAllReviewed(true)
//           }
//         }
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [partId, user])

//   const handleReviewComplete = async (isAllReviewed: boolean) => {
//     setIsAllReviewed(isAllReviewed)
//     if (currentReviewIndex + 1 < submissionsToReview.length) {
//       const reviewCriterias = await reviewService.getReviewCriteriasByPartId(
//         submissionsToReview[currentReviewIndex + 1].partId
//       )
//       console.log('Review Criterias1111:', reviewCriterias)
//       setcurrentReviewCriterias(reviewCriterias)
//       setCurrentReviewIndex(prev => prev + 1)
//     } else {
//       try {
//         if (user && part) {
//           // await reviewService.markReviewsCompleted(user.id, part.id)
//           setSubmissionsToReview([])
//           // setSubmissionExists(true)
//           toast.success(
//             'Все проверки завершены! Теперь вы можете перейти к следующей части.'
//           )
//         }
//       } catch (error) {
//         toast.error('Ошибка при завершении проверок')
//       }
//     }
//   }

//   const handlePractiseSubmition = async (
//     practiseSubmission: PracticeSubmission
//   ) => {
//     setPractiseSubmission(practiseSubmission)
//     if (practiseSubmission && !practiseSubmission.canReviewed) {
//       const submissionsToReviewData =
//         await reviewService.getSubmissionsToReview(practiseSubmission.id)
//       if (submissionsToReviewData.length > 0) {
//         setSubmissionsToReview(submissionsToReviewData)
//         const reviewCriterias = await reviewService.getReviewCriteriasByPartId(
//           submissionsToReviewData[currentReviewIndex].partId
//         )
//         setcurrentReviewCriterias(reviewCriterias)
//       } else {
//         setIsAllReviewed(true)
//       }
//     }
//     if (practiseSubmission && practiseSubmission.canReviewed) {
//       setIsAllReviewed(true)
//     }
//   }

//   const handleNextPart = async () => {
//     if (!user || !part) return

//     try {
//       if (part.type === CoursePartType.PRACTICAL && !practiseSubmission) {
//         throw new Error('Необходимо отправить решение')
//       }

//       await courseService.completePart(user.id, part.courseId, part.id)

//       if (nextPart) {
//         router.push(`/courses/${part.courseId}/${nextPart.id}`)
//       } else {
//         router.push(`/courses/${part.courseId}`)
//         toast.success('Курс успешно завершен!')
//       }
//     } catch (error) {
//       toast.error('Ошибка при переходе к следующей части')
//       console.error('Next part error:', error)
//     }
//   }

//   if (isLoading || !part) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         {/* Шапка */}
//         <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
//           <div className="space-y-2">
//             <Skeleton className="h-9 w-[400px]" />
//             <div className="flex items-center gap-4">
//               <Skeleton className="h-10 w-28" />
//               <Skeleton className="h-4 w-24" />
//             </div>
//           </div>
//           <Skeleton className="h-10 w-48" />
//         </div>

//         {/* Вкладки */}
//         <div className="flex space-x-4 mb-6">
//           <Skeleton className="h-10 w-32" />
//           <Skeleton className="h-10 w-32" />
//           <Skeleton className="h-10 w-32" />
//         </div>

//         {/* Контент */}
//         <div className="space-y-6">
//           <Skeleton className="h-64 w-full rounded-lg" />

//           <div className="space-y-4">
//             <Skeleton className="h-7 w-48" />
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-4/5" />
//               <Skeleton className="h-4 w-3/4" />
//             </div>

//             <div className="space-y-2">
//               <Skeleton className="h-7 w-56" />
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-2/3" />
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // if (!part) {
//   //   return (
//   //     <div className="max-w-4xl mx-auto px-4 py-8 text-center">
//   //       <h2 className="text-2xl font-bold mb-4">Часть не найдена</h2>
//   //       <Button
//   //         variant="outline"
//   //         onClick={() => router.push(`/courses/${part.courseId}`)}
//   //       >
//   //         ← Назад к курсу
//   //       </Button>
//   //     </div>
//   //   )
//   // }
//   const averageScore = reviewsInfo
//     ? reviewsInfo.reduce((acc, review) => acc + review.score, 0) /
//       reviewsInfo.length
//     : 0
//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <Button
//         variant="outline"
//         onClick={() => router.push(`/courses/${part.courseId}`)}
//         className="mb-6"
//       >
//         ← Назад к курсу
//       </Button>

//       <Card className="hover:shadow-md transition-shadow">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-3xl">{part.title}</CardTitle>
//             <Badge variant="outline">
//               {part.type === CoursePartType.THEORETICAL ? 'Theory' : 'Practice'}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {part.previewImageUrl && (
//             <img
//               src={`${process.env.NEXT_PUBLIC_API_STATIC_URL}${part.previewImageUrl}`}
//               alt={part.title}
//               className="w-full h-64 object-cover rounded-lg bg-muted mb-6"
//             />
//           )}

//           <p className="text-lg text-muted-foreground mb-6">
//             {part.description}
//           </p>

//           {part.type === CoursePartType.THEORETICAL &&
//             part.article &&
//             part.article.content && (
//               <div className="prose max-w-none">
//                 <BlockNoteRenderer content={part.article.content} />
//               </div>
//             )}
//           {part.type === CoursePartType.PRACTICAL &&
//             part.practice &&
//             part.practice.content && (
//               <div className="prose max-w-none">
//                 <BlockNoteRenderer content={part.practice.content} />
//               </div>
//             )}

//           {part.type === CoursePartType.PRACTICAL && part.practice && (
//             <>
//               <div className="border rounded-lg p-6 bg-muted/50">
//                 <h3 className="text-2xl font-bold mb-4">
//                   Ассеты для использования в проекте
//                 </h3>
//                 <Button className="cursor-pointer" type="button">
//                   <a
//                     href={`${process.env.NEXT_PUBLIC_API_URL}/files/${part.practice.assetsFileUrl}`}
//                   >
//                     Скачать
//                   </a>
//                 </Button>
//               </div>
//               {practiseSubmission ? (
//                 <div className="mt-8">
//                   {submissionsToReview.length > 0 ? (
//                     <ReviewSubmissionForm
//                       submission={submissionsToReview[currentReviewIndex]}
//                       reviewerSubmissionId={practiseSubmission.id}
//                       reviewCriterias={currentReviewCriterias}
//                       currentReview={currentReviewIndex + 1}
//                       totalReviews={submissionsToReview.length}
//                       onReviewComplete={handleReviewComplete}
//                     />
//                   ) : (
//                     <div className="text-center py-6">
//                       <h3 className="text-xl font-bold mb-4">
//                         {practiseSubmission.canReviewed
//                           ? 'Решение на проверке'
//                           : 'Ожидайте проверки вашего решения'}
//                       </h3>
//                       <p className="text-muted-foreground">
//                         {practiseSubmission.canReviewed &&
//                           'Ваше решение будет проверено другими участниками. Вы получите уведомление по завершении проверки.'}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <PractiseSubmissionForm
//                   coursePart={part}
//                   onSubmissionSuccess={handlePractiseSubmition}
//                 />
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//       {user && isAllReviewed && (
//         <Button type="button" className="w-full mt-5" onClick={handleNextPart}>
//           {nextPart ? 'Следующая часть' : 'Завершить курс'}
//         </Button>
//       )}
//     </div>
//   )
// }
