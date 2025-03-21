'use client'
import { SearchBar } from '@/shared/ui/search-bar'
import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { useRouter } from 'next/navigation'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { axiosWithAuth } from '@/shared/api/axios'

export interface CourseLearningObjective {
  id: string
  description: string
  sortOrder: number
}

export interface Course {
  id: string
  title: string
  description: string
  previewImageUrl: string
  prerequisites: string
  duration: number
  difficulty: Difficulty
  learningObjectives: CourseLearningObjective[]
  createdAt: string
  updatedAt: string
}

export enum Difficulty {
  NEWBIE = 'Новичок',
  BEGINNER = 'Начинающий',
  INTERMEDIATE = 'Средний уровень',
  ADVANCED = 'Продвинутый'
}
export default function Courses() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
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

  const handleSearch = (value: string) => {
    console.log('Performing search for:', value)
  }

  const handleCreateCourse = () => {
    router.push('/admin/courses/create')
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.NEWBIE:
        return 'bg-green-100 text-green-800'
      case Difficulty.BEGINNER:
        return 'bg-blue-100 text-blue-800'
      case Difficulty.INTERMEDIATE:
        return 'bg-yellow-100 text-yellow-800'
      case Difficulty.ADVANCED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            placeholder="Поиск курсов..."
          />
        </div>
        <Button onClick={handleCreateCourse} className="md:w-auto">
          Создать курс
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6 space-y-4">
                {course.previewImageUrl && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_STATIC_URL}${course.previewImageUrl}`}
                    alt={course.title}
                    className="rounded-lg h-48 w-full object-cover mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-gray-600 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline">{course.duration} часов</Badge>
                </div>

                {/* <div className="space-y-2">
                  <h4 className="font-medium">Цели обучения:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {course.learningObjectives
                      ?.slice(0, 3)
                      .map((obj, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 line-clamp-2"
                        >
                          {obj.description}
                        </li>
                      ))}
                  </ul>
                </div> */}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
