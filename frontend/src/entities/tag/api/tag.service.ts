import { axiosWithAuth } from '@/shared/api/axios'
import { Tag } from '../model/types'
export const tagService = {
  async getTags(name: string): Promise<Tag[]> {
    const response = await axiosWithAuth.get<Tag[]>(
      `/tags?search=${encodeURIComponent(name)}`
    )
    return response.data
  }
}
