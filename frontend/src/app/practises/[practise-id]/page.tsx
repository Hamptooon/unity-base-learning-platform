'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Star, Download, Github } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ComplaintReviewDialog from '@/entities/practise/ui/user/complaint-review-dialog'
import { axiosWithAuth } from '@/shared/api/axios'
import { practiseService } from '@/entities/practise/api/practise.service'
import {
  StandalonePractice,
  StandalonePracticeSubmission
} from '@/entities/practise/model/types'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { LuMonitorPlay } from 'react-icons/lu'
import { FiAlertTriangle } from 'react-icons/fi'
import { FaRegLightbulb } from 'react-icons/fa'

import { PractiseInfo, ReviewsInfo } from '@/entities/course/model/types'
import { Card, CardContent } from '@/shared/ui/card'
import { Calendar } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FaRegCheckCircle } from 'react-icons/fa'

import { reviewService } from '@/features/admin/course/api/review.service'
import { useUser } from '@/features/auth/provider/user-provider'
import { Skeleton } from '@/shared/ui/skeleton'
import { PractiseSubmissionForm } from '@/entities/practise/ui/user/practise-submission-form'
import { toast } from 'react-toastify'
import { ReviewSubmissionForm } from '@/entities/practise/ui/user/practise-review-form'
export default function PracticePage() {
  const { 'practise-id': practiseId } = useParams()
  const { user } = useUser()
  const [practiseSubmission, setPractiseSubmission] =
    useState<StandalonePracticeSubmission | null>(null)
  const [practiseInfo, setPractiseInfo] = useState<StandalonePractice | null>(
    null
  )
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const [submissionsToReview, setSubmissionsToReview] = useState<
    StandalonePracticeSubmission[]
  >([])
  const [reviewsInfo, setReviewsInfo] = useState<ReviewsInfo[] | null>(null)

  const [loading, setLoading] = useState(false)
  // const [complaintReview, setComplaintReview] =
  //   useState<ComplaintReview | null>(null)
  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true)
      try {
        const practiseInfo = await practiseService.getPractise(
          practiseId as string
        )
        if (user?.id) {
          const practiseSubmission =
            await practiseService.getPractiseSubmission(
              practiseId as string,
              user?.id as string
            )

          setPractiseSubmission(practiseSubmission)
          if (practiseSubmission && !practiseSubmission.canReviewed) {
            const submissionsToReviewData =
              await practiseService.getSubmissionsToReview(
                practiseId as string,
                practiseSubmission.id
              )

            console.log('Submissions to review:', submissionsToReviewData)
            if (submissionsToReviewData.length > 0) {
              setSubmissionsToReview(submissionsToReviewData)
            }
            // else {
            //   setIsAllReviewed(true)
            // }
          }
          if (practiseSubmission.canReviewed) {
            const reviewsInfo = await practiseService.getReviewsBySubmissionId(
              practiseSubmission.id
            )
            console.log('Reviews Info:', reviewsInfo)
            setReviewsInfo(reviewsInfo)
          }
        }

        console.log('Practise Info:', practiseInfo)
        setPractiseInfo(practiseInfo)
        //   const reviewsInfo = await practiseService.getReviewsByPractiseSubmission(
        //     practiseId as string
        //   )
        // console.log('Reviews Info:', reviewsInfo)
        // setReviewsInfo(reviewsInfo)
      } catch (error) {
        console.error('Error fetching practise solution:', error)
      } finally {
        setLoading(false)
      }

      //   const practiseSubmissionInfo =
      //     await practiseService.getPractiseSubmissionInfo(practiseId as string)
      //   console.log('Practise Solution:', practiseSubmissionInfo)
      //   setPractiseSolution(practiseSubmissionInfo)
    }
    fetchInfo()
  }, [practiseId, user?.id])
  //   const handleComplaintReview = async (reviewId: string) => {
  //     try {
  //       const complaintReviewData = await reviewService.getComplaintReview(
  //         reviewId,
  //         practiseSubmission?.userId as string
  //       )
  //       console.log('Complaint Review:', complaintReviewData)
  //       setComplaintReview(complaintReviewData)
  //     } catch (error) {
  //       console.error('Error fetching complaint review:', error)
  //     }
  //   }
  const handleReviewComplete = async (isAllReviewed: boolean) => {
    // setIsAllReviewed(isAllReviewed)
    if (currentReviewIndex + 1 < submissionsToReview.length) {
      //   const reviewCriterias = await reviewService.getReviewCriteriasByPartId(
      //     submissionsToReview[currentReviewIndex + 1].partId
      //   )
      //   console.log('Review Criterias1111:', reviewCriterias)
      //   setcurrentReviewCriterias(reviewCriterias)
      setCurrentReviewIndex(prev => prev + 1)
    } else {
      try {
        if (user && practiseInfo) {
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
    practiseSubmission: StandalonePracticeSubmission
  ) => {
    setPractiseSubmission(practiseSubmission)
    if (practiseSubmission && !practiseSubmission.canReviewed) {
      const submissionsToReviewData =
        await practiseService.getSubmissionsToReview(
          practiseId as string,
          practiseSubmission.id
        )

      console.log('Submissions to review:', submissionsToReviewData)
      if (submissionsToReviewData.length > 0) {
        setSubmissionsToReview(submissionsToReviewData)
      }
      // else {
      //   setIsAllReviewed(true)
      // }
    }
  }

  if (loading || !practiseInfo) {
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
  const averageScore = reviewsInfo
    ? reviewsInfo.reduce((acc, review) => acc + review.score, 0) /
      reviewsInfo.length
    : 0
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
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
        </div>
      </div>

      {/* Вкладки */}
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
                practiseInfo.previewImageUrl
                  ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${practiseInfo.previewImageUrl}`
                  : '/placeholder-course.png'
              }
              alt={practiseInfo.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex items-center gap-4 justify-between">
            <div className="flex gap-3">
              {practiseInfo.tags?.map(tag => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/files/${practiseInfo.assetsFileUrl}`}
                download
              >
                Скачать материалы
              </a>
            </Button>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold">{practiseInfo.title}</h2>
            <p className="text-muted-foreground mt-2">
              {practiseInfo.description}
            </p>

            <div
              className="mt-6"
              dangerouslySetInnerHTML={{
                __html: practiseInfo.content
              }}
            />
          </div>
        </TabsContent>

        {/* Контент: Решение */}
        <TabsContent value="solution" className="mt-6 space-y-6 max-w-7xl">
          {practiseSubmission && submissionsToReview.length > 0 && (
            <ReviewSubmissionForm
              submission={submissionsToReview[currentReviewIndex]}
              reviewerSubmissionId={practiseSubmission.id}
              reviewCriterias={practiseInfo.reviewCriteria}
              currentReview={currentReviewIndex + 1}
              totalReviews={submissionsToReview.length}
              onReviewComplete={handleReviewComplete}
            />
          )}

          {!practiseSubmission && submissionsToReview.length == 0 && (
            <PractiseSubmissionForm
              practise={practiseInfo}
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
                          <Badge variant="secondary">{criteria.score}/5</Badge>
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
    </div>
  )
}
