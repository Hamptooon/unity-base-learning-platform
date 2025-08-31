// import { useEffect, useState } from 'react'
// import { Course } from '@/entities/course/model/types'
// import { axiosWithAuth } from '@/shared/api/axios'
// import { courseService } from '@/entities/course/api/course.service'
// export const useCourses = () => {
//   const [courses, setCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await axiosWithAuth.get('/courses')
//         const data = await response.data
//         setCourses(data)
//       } catch (err) {
//         setError('Не удалось загрузить курсы')
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCourses()
//   }, [])
//   const deleteCourse = async (courseId: string) => {
//     try {
//       await courseService.deleteCourse(courseId)
//       setCourses(courses.filter(course => course.id !== courseId))
//     } catch (err) {
//       setError('Не удалось удалить курс')
//       console.error(err)
//     }
//   }
//   return { courses, loading, error, setCourses, deleteCourse }
// }
// use-courses.ts
import { useEffect, useState } from 'react'
import { Course } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { toast } from 'react-toastify'

export const useCourses = (params: {
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
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchCourses = async () => {
      try {
        setLoading(true)
        console.log('params111111', params)
        const response = await courseService.getCourses({
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
        setCourses(response.data)
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

    fetchCourses()

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

  const deleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId)
      setCourses(courses.filter(course => course.id !== courseId))
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }

  const publishCourse = async (courseId: string) => {
    try {
      await courseService.publishCourse(courseId)
      toast.success('Курс успешно опубликован')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  const hideCourse = async (courseId: string) => {
    try {
      await courseService.hideCourse(courseId)
      toast.success('Курс успешно скрыт')
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  return {
    courses,
    total,
    loading,
    error,
    setCourses,
    deleteCourse,
    publishCourse,
    hideCourse
  }
}
