import { axiosWithAuth } from '@/shared/api/axios'
// import { IUser } from '@/entities/user/model/types'
// import { Course } from '@/entities/course/model/types'
// import { CoursePart } from '@/entities/course/model/types'
// import { CourseUserProgress } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
// import {CoursePractise} from '@/entities/course/model/types'
// import { ReviewCriteria } from '@/entities/course/model/types'
// import {
//   ReviewCriteria,
//   CreateCourseMainInfo,
//   CreateCoursePart
// } from '@/entities/course/model/types'
import { ReviewsInfo } from '@/entities/course/model/types'
import { PractiseInfo } from '@/entities/course/model/types'
import { PractiseSolution, StandalonePractiseSolution } from '../model/types'
export const practiseSolutionService = {
  async getPractiseSolution(
    practiseSolutionId: string
  ): Promise<PracticeSubmission> {
    const response = await axiosWithAuth.get<PracticeSubmission>(
      `/solutions/${practiseSolutionId}`
    )
    return response.data
  },
  async getPractiseInfoBySolutionId(
    practiseSolutionId: string
  ): Promise<PractiseInfo> {
    const response = await axiosWithAuth.get<PractiseInfo>(
      `/solutions/${practiseSolutionId}/practise`
    )
    return response.data
  },
  async getReviewsBySolutionId(
    practiseSolutionId: string
  ): Promise<ReviewsInfo[]> {
    const response = await axiosWithAuth.get<ReviewsInfo[]>(
      `/solutions/${practiseSolutionId}/reviews`
    )
    return response.data
  },

  async getPractisesSolutionsByUserId(
    userId: string
  ): Promise<PractiseSolution[]> {
    const response = await axiosWithAuth.get<PractiseSolution[]>(
      `/solutions/user/${userId}`
    )
    return response.data
  },

  async getStandalonePractisesSolutionsByUserId(
    userId: string
  ): Promise<StandalonePractiseSolution[]> {
    const response = await axiosWithAuth.get<StandalonePractiseSolution[]>(
      `/solutions/practises/user/${userId}`
    )
    return response.data
  },

  async getCoursePractisesExceptByUserId(
    userId: string
  ): Promise<PractiseSolution[]> {
    const response = await axiosWithAuth.get<PractiseSolution[]>(
      `/solutions/coursepractises/except/${userId}`
    )
    return response.data
  }
}
