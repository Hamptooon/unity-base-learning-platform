import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'
import { Course } from '@/entities/course/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { CourseUserProgress } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
import { ReviewCriteria } from '@/entities/course/model/types'
export const reviewService = {
  async getUnreviewedSubmissions(
    userId: string
  ): Promise<PracticeSubmission[]> {
    const response = await axiosWithAuth.get<PracticeSubmission[]>(
      `/reviews/unreviewed-practises/${userId}`
    )
    return response.data
  },
  async setTargetReviews(
    userId: string,
    practiseSubmitionId: string
  ): Promise<string[]> {
    const response = await axiosWithAuth.get<string[]>(
      `/reviews/set-target-reviews/${userId}/${practiseSubmitionId}`
    )
    return response.data
  },
  async getSubmissionById(submissionId: string) {
    const response = await axiosWithAuth.get<PracticeSubmission>(
      `/reviews/submissions/${submissionId}`
    )
    return response.data
  },
  async getReviewCriterias(practiseId: string) {
    const response = await axiosWithAuth.get<ReviewCriteria[]>(
      `/reviews/criterias/${practiseId}`
    )
    return response.data
  },
  async getReviewCriteriasByPartId(partId: string) {
    const response = await axiosWithAuth.get<ReviewCriteria[]>(
      `/reviews/criterias/parts/${partId}`
    )
    return response.data
  }
}
