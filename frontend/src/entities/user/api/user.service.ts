import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '../model/types'
export const userService = {
  async getUserById(userId: string): Promise<IUser> {
    const response = await axiosWithAuth.get<IUser>(`/users/${userId}`)
    return response.data
  }
  //   async getPractiseSolution(
  //     practiseSolutionId: string
  //   ): Promise<PracticeSubmission> {
  //     const response = await axiosWithAuth.get<PracticeSubmission>(
  //       `/solutions/${practiseSolutionId}`
  //     )
  //     return response.data
  //   },
  //   async getPractiseInfoBySolutionId(
  //     practiseSolutionId: string
  //   ): Promise<PractiseInfo> {
  //     const response = await axiosWithAuth.get<PractiseInfo>(
  //       `/solutions/${practiseSolutionId}/practise`
  //     )
  //     return response.data
  //   },
  //   async getReviewsBySolutionId(
  //     practiseSolutionId: string
  //   ): Promise<ReviewsInfo[]> {
  //     const response = await axiosWithAuth.get<ReviewsInfo[]>(
  //       `/solutions/${practiseSolutionId}/reviews`
  //     )
  //     return response.data
  //   },

  //   async getPractisesSolutionsByUserId(
  //     userId: string
  //   ): Promise<PractiseSolution[]> {
  //     const response = await axiosWithAuth.get<PractiseSolution[]>(
  //       `/solutions/user/${userId}`
  //     )
  //     return response.data
  //   },
}
