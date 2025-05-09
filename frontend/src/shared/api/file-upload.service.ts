import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'

export const fileService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosWithAuth.post<string>(
      '/files/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },
  async uploadUnityPackage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    console.log('file', file)
    const response = await axiosWithAuth.post<string>(
      '/files/upload-unity-package',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }
}
