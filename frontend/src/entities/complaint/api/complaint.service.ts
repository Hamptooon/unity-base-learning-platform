import { axiosWithAuth } from '@/shared/api/axios'
import { ComplaintReview } from '../model/types'

// import { CreateArticle, Article, UpdateArticle } from '../model/types'
export const complaintService = {
  //   async createArticle(data: CreateArticle): Promise<Article> {
  //     const response = await axiosWithAuth.post<Article>('/articles', data)
  //     return response.data
  //   },
  async getComplaints(): Promise<ComplaintReview[]> {
    const response = await axiosWithAuth.get<ComplaintReview[]>(
      '/complaints/reviews'
    )
    return response.data
  },
  async rejectComplaint(complaintId: string) {
    await axiosWithAuth.post<void>(`/complaints/${complaintId}/reject`)
  },
  async rejectComplaintPractise(complaintId: string) {
    await axiosWithAuth.post<void>(
      `/complaints/practises/${complaintId}/reject`
    )
  },
  async acceptComplaintPractise(complaintId: string) {
    await axiosWithAuth.post<void>(
      `/complaints/practises/${complaintId}/accept`
    )
  },
  async acceptComplaint(complaintId: string) {
    await axiosWithAuth.post<void>(`/complaints/${complaintId}/accept`)
  },
  async getComplaintsPractises(): Promise<ComplaintReview[]> {
    const response = await axiosWithAuth.get<ComplaintReview[]>(
      '/complaints/practises/reviews'
    )
    return response.data
  }
}
//   async updateArticle(articleId: string, data: UpdateArticle) {
//     const response = await axiosWithAuth.put<Article>(
//       `/articles/${articleId}`,
//       data
//     )
//     return response.data
//   },
//   async getArticle(articleId: string): Promise<Article> {
//     const response = await axiosWithAuth.get<Article>(`/articles/${articleId}`)
//     return response.data
//   },
//   async deleteArticle(articleId: string): Promise<void> {
//     const response = await axiosWithAuth.delete<void>(`/articles/${articleId}`)
//     return response.data
//   }
