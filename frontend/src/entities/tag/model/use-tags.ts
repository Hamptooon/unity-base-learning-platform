// use-tags.ts
import { useEffect, useState } from 'react'
import { axiosWithAuth } from '@/shared/api/axios'
import { Tag } from './types'

export const useTags = (type?: 'course' | 'article') => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axiosWithAuth.get('/tags', {
          params: { type }
        })
        setTags(response.data)
      } catch (error) {
        console.error('Ошибка при загрузке тегов:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [type])

  return { tags, loading }
}
