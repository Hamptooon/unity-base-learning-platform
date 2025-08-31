import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'
import { Course } from '@/entities/course/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { CourseUserProgress } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
import { ReviewCriteria } from '@/entities/course/model/types'
import { ComplaintReview } from '@/entities/reviews/model/types'
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
  },
  async getSubmissionsToReview(reviewerSubmissionId: string) {
    const response = await axiosWithAuth.get<PracticeSubmission[]>(
      `/reviews/unreviewed-practises/${reviewerSubmissionId}`
    )
    return response.data
  },

  // submissions/:submissionId/non-reviewer-submition
  async reviewSubmission(
    submissionId: string,
    reviewerSubmissionId: string | null,
    reviewData: {
      comment: string
      scores: {
        criteriaId: string
        score: number
      }
    }
  ): Promise<boolean> {
    const response = await axiosWithAuth.post<boolean>(
      `/reviews/submissions/${submissionId}`,
      { reviewerSubmissionId, ...reviewData }
    )
    return response.data
  },
  async reviewSubmissionWithoutReviewerSubmission(
    submissionId: string,
    reviewerId: string,
    reviewData: {
      comment: string
      scores: {
        criteriaId: string
        score: number
      }
    }
  ): Promise<boolean> {
    const response = await axiosWithAuth.post<boolean>(
      `/reviews/submissions/${submissionId}/non-reviewer-submition`,
      { reviewerId, ...reviewData }
    )
    return response.data
  },
  async complaintReview(reviewId: string, data: ComplaintReview) {
    const response = await axiosWithAuth.post<ComplaintReview>(
      `/complaints/complaint/${reviewId}`,
      data
    )
    return response.data
  },
  async getComplaintReview(reviewId: string, reviewedUserId: string) {
    const response = await axiosWithAuth.get<ComplaintReview>(
      `/reviews/complaint/${reviewId}/${reviewedUserId}`
    )
    return response.data
  },
  async getReviewsCriteriasBySubmissionId(practiseSubmissionId: string) {
    const response = await axiosWithAuth.get<ReviewCriteria[]>(
      `/reviews/criterias/practise/${practiseSubmissionId}`
    )
    return response.data
  },
  async checkReview(reviewerId: string, submissionId: string) {
    const response = await axiosWithAuth.get<boolean>(
      `/reviews/check/${reviewerId}/${submissionId}`
    )
    return response.data
  }
}
