import { axiosWithAuth } from '@/shared/api/axios'
import { CreateArticle, Article, UpdateArticle } from '../model/types'
export const articleService = {
  async createArticle(data: CreateArticle): Promise<Article> {
    const response = await axiosWithAuth.post<Article>('/articles', data)
    return response.data
  },
  async getArticles(
    params: {
      page: number
      limit: number
      status?: 'published' | 'draft'
      search?: string
      tags?: string // <--- добавили
      sortOrder?: 'asc' | 'desc'
    },
    signal?: AbortSignal
  ): Promise<{ data: Article[]; total: number }> {
    const response = await axiosWithAuth.get('/articles', {
      params: {
        ...params,
        page: params.page.toString(),
        limit: params.limit.toString()
      },
      signal
    })
    return response.data
  },
  async updateArticle(articleId: string, data: UpdateArticle) {
    const response = await axiosWithAuth.put<Article>(
      `/articles/${articleId}`,
      data
    )
    return response.data
  },
  async getArticle(articleId: string): Promise<Article> {
    const response = await axiosWithAuth.get<Article>(`/articles/${articleId}`)
    return response.data
  },
  async deleteArticle(articleId: string): Promise<void> {
    const response = await axiosWithAuth.delete<void>(`/articles/${articleId}`)
    return response.data
  },
  async hideArticle(articleId: string) {
    const response = await axiosWithAuth.get<Article>(
      `/articles/${articleId}/hide`
    )
    return response.data
  },
  async publishArticle(articleId: string) {
    const response = await axiosWithAuth.get<Article>(
      `/articles/${articleId}/publish`
    )
    return response.data
  }
}
