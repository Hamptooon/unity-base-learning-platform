import { useEffect, useState } from 'react'
import { axiosWithAuth } from '@/shared/api/axios'
import { articleService } from '../api/article.service'
import { Article } from './types'
import { toast } from 'react-toastify'
export const useArticles = (params: {
  page: number
  limit: number
  status?: 'published' | 'draft'
  search?: string
  tags?: string // <--- добавили
  sortOrder?: 'asc' | 'desc'
}) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchArticles = async () => {
      try {
        const response = await articleService.getArticles(
          {
            page: params.page,
            limit: params.limit,
            status: params.status,
            search: params.search,
            tags: params.tags,
            sortOrder: params.sortOrder
          },
          controller.signal
        )
        setArticles(response.data)
        setTotal(response.total)
      } catch (err) {
        setError('Не удалось загрузить статьи')
        console.error(err)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchArticles()
  }, [
    params.page,
    params.limit,
    params.status,
    params.search,
    params.tags,
    params.sortOrder
  ])
  const deleteArticle = async (articleId: string) => {
    try {
      await articleService.deleteArticle(articleId)
      setArticles(articles.filter(article => article.id !== articleId))
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  const publishArticle = async (articleId: string) => {
    try {
      await articleService.publishArticle(articleId)
      toast.success('Статья успешно опубликована')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }

  const hideArticle = async (articleId: string) => {
    try {
      await articleService.hideArticle(articleId)
      toast.success('Статья успешно скрыта')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  return {
    articles,
    total,
    loading,
    error,
    setArticles,
    deleteArticle,
    publishArticle,
    hideArticle
  }
}
