import { useEffect, useState } from 'react'
import { Course } from '@/entities/course/model/types'
import { axiosWithAuth } from '@/shared/api/axios'
import { courseService } from '@/entities/course/api/course.service'
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosWithAuth.get('/courses')
        const data = await response.data
        setCourses(data)
      } catch (err) {
        setError('Не удалось загрузить курсы')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])
  const deleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId)
      setCourses(courses.filter(course => course.id !== courseId))
    } catch (err) {
      setError('Не удалось удалить курс')
      console.error(err)
    }
  }
  return { courses, loading, error, setCourses, deleteCourse }
}
