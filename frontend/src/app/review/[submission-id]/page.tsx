'use client'
import { useParams } from 'next/navigation'
import { ReviewCoursePractiseSubmissionForm } from '@/entities/reviews/ui/review-course-practise'
import { use, useEffect } from 'react'
import { courseService } from '@/entities/course/api/course.service'
import { reviewService } from '@/features/admin/course/api/review.service'
import { PracticeSubmission } from '@/entities/user/model/types'
import { useState } from 'react'
import { Skeleton } from '@/shared/ui/skeleton'
import { ReviewCriteria } from '@/entities/course/model/types'
import { useUser } from '@/features/auth/provider/user-provider'
import { toast } from 'react-toastify'
export default function ReviewSubmissionPage() {
  const { user } = useUser()
  const { 'submission-id': submissionId } = useParams()
  const [practiseSubmission, setPractiseSubmission] =
    useState<PracticeSubmission | null>(null)
  const [isReviewed, setIsReviewed] = useState(false)
  const [reviewCriterias, setReviewCriterias] = useState<ReviewCriteria[]>([])
  useEffect(() => {
    const loadData = async () => {
      if (!submissionId || !user?.id) {
        return
      }
      const checkReviewed = await reviewService.checkReview(
        user?.id as string,
        submissionId as string
      )

      setIsReviewed(checkReviewed)
      const submissionData = await reviewService.getSubmissionById(
        submissionId as string
      )
      const criteriasData =
        await reviewService.getReviewsCriteriasBySubmissionId(
          submissionId as string
        )
      console.log('criteriasData', criteriasData)
      setReviewCriterias(criteriasData)
      setPractiseSubmission(submissionData)
    }
    loadData()
  }, [submissionId, user?.id])

  if (!practiseSubmission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-2xl font-bold">Загрузка решения</h1>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isReviewed) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-2xl font-bold">Отзыв оставлен</h1>
          <p>Вы уже оставили отзыв на это решение</p>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-6xl flex flex-col items-center justify-center mx-auto p-10">
      <h1 className="text-2xl font-bold">Оставить отзыв</h1>
      <ReviewCoursePractiseSubmissionForm
        submission={practiseSubmission}
        reviewCriterias={reviewCriterias}
      />
    </div>
  )
}
