import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'
import { ICourse } from '@/entities/course/model/types'

export const courseService = {
  async createCourseInfo(data: ICourse): Promise<ICourse> {
    const response = await axiosWithAuth.post<ICourse>('/courses', data)
    return response.data
  }
}
