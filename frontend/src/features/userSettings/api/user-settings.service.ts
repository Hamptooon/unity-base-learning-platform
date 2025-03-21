import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'

export const currentUserService = {
  async updateUserInfo(data: {
    name: string
    bio: string | undefined
    email: string
  }): Promise<IUser> {
    const response = await axiosWithAuth.patch<IUser>('/users/me', data)
    return response.data
  }
}
