import { useEffect, useState } from 'react'
import { Course } from '@/entities/course/model/types'
import { practiseService } from '@/entities/practise/api/practise.service'
import { StandalonePractice } from './types'
import { toast } from 'react-toastify'
export const usePractises = (params: {
  page: number
  limit: number
  status?: 'published' | 'draft'
  difficulty?: string
  durationMin?: number
  durationMax?: number
  search?: string
  tags?: string // <--- добавили
  sortOrder?: 'asc' | 'desc'
}) => {
  const [practises, setPractises] = useState<StandalonePractice[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchPractises = async () => {
      try {
        setLoading(true)
        console.log('params111111', params)
        const response = await practiseService.getPractises({
          page: params.page,
          limit: params.limit,
          status: params.status,
          difficulty: params.difficulty,
          durationMin: params.durationMin,
          durationMax: params.durationMax,
          search: params.search,
          tags: params.tags,
          sortOrder: params.sortOrder
        })
        setPractises(response.data)
        setTotal(response.total)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Не удалось загрузить курсы')
          console.error(err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPractises()

    return () => controller.abort()
  }, [
    params.page,
    params.limit,
    params.status,
    params.difficulty,
    params.durationMin,
    params.durationMax,
    params.search,
    params.tags,
    params.sortOrder
  ])

  const deletePractise = async (practiseId: string) => {
    try {
      await practiseService.deletePractise(practiseId)
      setPractises(practises.filter(practise => practise.id !== practiseId))
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }

  const publishPractise = async (practiseId: string) => {
    try {
      await practiseService.publishPractise(practiseId)
      toast.success('Статья успешно опубликована')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  const hidePractise = async (practiseId: string) => {
    try {
      await practiseService.hidePractise(practiseId)
      toast.success('Статья успешно скрыта')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }

  return {
    practises,
    total,
    loading,
    error,
    setPractises,
    deletePractise,
    publishPractise,
    hidePractise
  }
}
