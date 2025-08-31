'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Star, Download, Github } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { axiosWithAuth } from '@/shared/api/axios'
import { practiseSolutionService } from '@/entities/practise-solution/api/practise-solution.service'
import { PracticeSubmission } from '@/entities/user/model/types'
import { PractiseInfo, ReviewsInfo } from '@/entities/course/model/types'
import ComplaintReviewDialog from '@/features/complaint-review/ui/complaint-review-dialog'
import { ComplaintReview } from '@/entities/reviews/model/types'
import { reviewService } from '@/features/admin/course/api/review.service'
import { useUser } from '@/features/auth/provider/user-provider'
import { Skeleton } from '@/shared/ui/skeleton'
// Моковые данные

export default function PracticePage() {
  const { 'practise-solution-id': practiseSolutionId } = useParams()
  const { user } = useUser()
  const [practiseSolution, setPractiseSolution] =
    useState<PracticeSubmission | null>(null)
  const [practiseInfo, setPractiseInfo] = useState<PractiseInfo | null>(null)
  const [reviewsInfo, setReviewsInfo] = useState<ReviewsInfo[] | null>(null)
  // const [complaintReview, setComplaintReview] =
  //   useState<ComplaintReview | null>(null)
  useEffect(() => {
    const fetchInfo = async () => {
      const practiseSolutionInfo =
        await practiseSolutionService.getPractiseSolution(
          practiseSolutionId as string
        )
      console.log('Practise Solution:', practiseSolutionInfo)
      setPractiseSolution(practiseSolutionInfo)

      const practiseInfo =
        await practiseSolutionService.getPractiseInfoBySolutionId(
          practiseSolutionId as string
        )
      console.log('Practise Info:', practiseInfo)
      setPractiseInfo(practiseInfo)
      const reviewsInfo = await practiseSolutionService.getReviewsBySolutionId(
        practiseSolutionId as string
      )
      console.log('Reviews Info:', reviewsInfo)
      setReviewsInfo(reviewsInfo)
    }
    fetchInfo()
  }, [practiseSolutionId])
  // const handleComplaintReview = async (reviewId: string) => {
  //   try {
  //     const complaintReviewData = await reviewService.getComplaintReview(
  //       reviewId,
  //       practiseSolution?.userId as string
  //     )
  //     console.log('Complaint Review:', complaintReviewData)
  //     setComplaintReview(complaintReviewData)
  //   } catch (error) {
  //     console.error('Error fetching complaint review:', error)
  //   }
  // }
  if (!practiseSolution || !practiseInfo) {
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{practiseInfo.title}</h1>
          <div className="flex items-center mt-2">
            <div className="flex items-center bg-black/80 px-3 py-2 rounded">
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
        <TabsContent value="description" className="mt-6 space-y-6">
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

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold">Описание задания</h2>
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
        <TabsContent value="solution" className="mt-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Превью проекта</h2>
            <iframe
              src={practiseSolution?.githubPagesUrl}
              className="w-full h-96 rounded-lg border shadow-sm"
              title="Project Preview"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Github className="w-5 h-5" /> GitHub Репозиторий
                </h3>
                <a
                  href={practiseSolution?.githubRepo}
                  target="_blank"
                  className="text-blue-600 hover:underline break-words"
                >
                  {practiseSolution?.githubRepo}
                </a>
              </div>

              <div>
                <h3 className="font-semibold">Дата отправки</h3>
                <p className="text-muted-foreground">
                  {/* {new Date(practiseSolution?.createdAt).toLocaleDateString()} */}
                  {practiseSolution?.createdAt}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Сложности</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {practiseSolution?.challenges}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Изучено</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {practiseSolution?.learned}
                </p>
              </div>
            </div>
          </div>
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
                    reviewedUserId={practiseSolution.userId}
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
