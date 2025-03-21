import axios, { type CreateAxiosDefaults } from 'axios'
import { API_CONFIG } from '@/shared/config/api.config'
import { errorCatch } from '@/shared/api/error'
import { authTokenService } from '@/shared/api/auth-token.service'

const axiosClassic = axios.create(API_CONFIG)
const axiosWithAuth = axios.create(API_CONFIG)

axiosWithAuth.interceptors.request.use(config => {
  const accessToken = authTokenService.getAccessToken()
  if (config?.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

axiosWithAuth.interceptors.response.use(
  config => config,
  async error => {
    const originalRequest = error.config
    if (
      (error?.response?.status === 401 ||
        errorCatch(error) === 'jwt expired' ||
        errorCatch(error) === 'jwt must be provided') &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true
      try {
        await authTokenService.getNewTokens()
        return axiosWithAuth.request(originalRequest)
      } catch (error) {
        if (errorCatch(error) === 'jwt expired')
          authTokenService.removeFromStorage()
      }
    }
    throw error
  }
)

export { axiosClassic, axiosWithAuth }
