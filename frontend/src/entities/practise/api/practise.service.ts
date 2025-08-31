import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'
import { Course, ReviewsInfo } from '@/entities/course/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { CourseUserProgress } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
import { ComplaintReview } from '@/entities/reviews/model/types'
import {
  CreatePractise,
  StandalonePractice,
  StandalonePracticeSubmission,
  StandalonePractiseCriteria,
  UpdatePractise
} from '../model/types'

export const practiseService = {
  async createPractise(data: CreatePractise): Promise<StandalonePractice> {
    const response = await axiosWithAuth.post<StandalonePractice>(
      '/practises',
      data
    )
    return response.data
  },
  async submitPractice(
    practiseId: string,
    data: Omit<
      StandalonePracticeSubmission,
      'isReviewed' | 'canReviewed' | 'score' | 'createdAt' | 'updatedAt' | 'id'
    >
  ) {
    const response = await axiosWithAuth.post<StandalonePracticeSubmission>(
      `practises/${practiseId}/submissions`,
      data
    )
    return response.data
  },

  async getPractiseSubmission(practiseId: string, userId: string) {
    const response = await axiosWithAuth.get<StandalonePracticeSubmission>(
      `practises/${practiseId}/submission/${userId}`
    )
    return response.data
  },

  //   async createCourseMainInfo(data: CreateCourseMainInfo): Promise<StandalonePractice> {
  //     const response = await axiosWithAuth.post<Course>('/practises', data)
  //     return response.data
  //   },

  async getPractises(
    params: {
      page: number
      limit: number
      status?: 'published' | 'draft'
      difficulty?: string
      durationMin?: number
      durationMax?: number
      search?: string
      tags?: string // <--- добавили
      sortOrder?: 'asc' | 'desc'
    },
    signal?: AbortSignal
  ): Promise<{ data: StandalonePractice[]; total: number }> {
    console.log('params', params)
    const response = await axiosWithAuth.get('/practises', {
      params: {
        ...params,
        page: params.page.toString(),
        limit: params.limit.toString()
      },
      signal
    })
    return response.data
  },
  async getPractise(practiseId: string): Promise<StandalonePractice> {
    const response = await axiosWithAuth.get<StandalonePractice>(
      `/practises/${practiseId}`
    )
    return response.data
  },
  async updatePractise(articleId: string, data: UpdatePractise) {
    const response = await axiosWithAuth.put<StandalonePractice>(
      `/practises/${articleId}`,
      data
    )
    return response.data
  },
  async deleteCriteria(practiseId: string, criteriaId: string): Promise<void> {
    const response = await axiosWithAuth.delete<void>(
      `/practises/${practiseId}/criterias/${criteriaId}`
    )
    return response.data
  },
  async createCriteria(practiseId: string, data: StandalonePractiseCriteria) {
    const response = await axiosWithAuth.post<StandalonePractiseCriteria>(
      `/practises/${practiseId}/criterias`,
      data
    )
    return response.data
  },
  async updateCriteria(
    practiseId: string,
    criteriaId: string,
    data: StandalonePractiseCriteria
  ) {
    const response = await axiosWithAuth.put<StandalonePractiseCriteria>(
      `/practises/${practiseId}/criterias/${criteriaId}`,
      data
    )
    return response.data
  },
  async deletePractise(practiseId: string): Promise<void> {
    const response = await axiosWithAuth.delete<void>(
      `/practises/${practiseId}`
    )
    return response.data
  },
  async getSubmissionsToReview(practiseId: string, userId: string) {
    const response = await axiosWithAuth.get<StandalonePracticeSubmission[]>(
      `/practises/${practiseId}/submissions/${userId}`
    )
    return response.data
  },
  async reviewSubmission(
    submissionId: string,
    reviewerSubmissionId: string,
    reviewData: {
      comment: string
      scores: {
        criteriaId: string
        score: number
      }
    }
  ): Promise<boolean> {
    const response = await axiosWithAuth.post<boolean>(
      `/practises/reviews/submissions/${submissionId}`,
      { reviewerSubmissionId, ...reviewData }
    )
    return response.data
  },
  async getReviewsBySubmissionId(submissionId: string) {
    const response = await axiosWithAuth.get<ReviewsInfo[]>(
      `/practises/reviews/submissionss/${submissionId}`
    )
    return response.data
  },
  async getComplaintReview(reviewId: string, reviewedUserId: string) {
    const response = await axiosWithAuth.get<ComplaintReview>(
      `/practises/reviews/complaint/${reviewId}/${reviewedUserId}`
    )
    return response.data
  },
  async complaintReview(reviewId: string, data: ComplaintReview) {
    const response = await axiosWithAuth.post<ComplaintReview>(
      `/practises/reviews/complaint/${reviewId}`,
      data
    )
    return response.data
  },

  async hidePractise(practiseId: string) {
    const response = await axiosWithAuth.get<StandalonePractice>(
      `/practises/${practiseId}/hide`
    )
    return response.data
  },
  async publishPractise(practiseId: string) {
    const response = await axiosWithAuth.get<StandalonePractice>(
      `/practises/${practiseId}/publish`
    )
    return response.data
  }
}
