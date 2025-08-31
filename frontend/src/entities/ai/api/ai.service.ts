import { axiosWithAuth } from '@/shared/api/axios'
interface AiCommentCheck {
  comment: string
}
export const aiService = {
  async aiCommentCheck(
    data: AiCommentCheck
  ): Promise<{ score: number; explanation: string }> {
    const response = await axiosWithAuth.post<{
      score: number
      explanation: string
    }>('/ai/checktext', data)
    return response.data
  }
}
