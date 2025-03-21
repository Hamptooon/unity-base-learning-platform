import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'

export const authService = {
  async getCurrentUser(): Promise<IUser | null> {
    try {
      const response = await axiosWithAuth.get<IUser>('/auth/me')
      if (response.status !== 200) return null
      return response.data
    } catch (error) {
      return null
    }
  },
  async verifyEmail(token: string) {
    const response = await axiosWithAuth.get('/auth/verify-email', {
      params: { token }
    })
    return response.data
  },
  async resendVerification() {
    const response = await axiosWithAuth.post('/auth/resend-verification')
    return response.data
  },
  async logout() {
    await axiosWithAuth.post('/auth/logout')
    Cookies.remove('accessToken')
  }
}
