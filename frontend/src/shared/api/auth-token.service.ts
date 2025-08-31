import Cookies from 'js-cookie'
import { axiosClassic } from '@/shared/api/axios'
import { IAuthResponse } from '@/shared/types/types'
export enum EnumTokens {
  'ACCESS_TOKEN' = 'accessToken',
  'REFRESH_TOKEN' = 'refreshToken'
}

export const authTokenService = {
  getAccessToken() {
    const accessToken = Cookies.get(EnumTokens.ACCESS_TOKEN)
    return accessToken || null
  },

  saveTokenStorage(accessToken: string) {
    Cookies.set(EnumTokens.ACCESS_TOKEN, accessToken, {
      domain: 'localhost',
      sameSite: 'lax',
      expires: 20
    })
  },

  removeFromStorage() {
    Cookies.remove(EnumTokens.ACCESS_TOKEN)
  },
  async getNewTokens() {
    const response = await axiosClassic.post<IAuthResponse>(
      '/auth/access-token'
    )

    if (response.data.accessToken)
      this.saveTokenStorage(response.data.accessToken)

    return response
  }
}
