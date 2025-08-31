'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Course,
  CoursePart,
  Difficulty,
  CoursePartType,
  CourseUserProgress
} from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import Link from 'next/link'
import { useUser } from '@/features/auth/provider/user-provider'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Progress } from '@/shared/ui/progress'
export default function CoursePage() {
  const { 'course-id': courseId } = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortedParts, setSortedParts] = useState<CoursePart[]>([])
  const { user } = useUser()
  const router = useRouter()
  const [userCourseProgress, setUserCourseProgress] =
    useState<CourseUserProgress | null>(null)
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (user) {
          const data = await courseService.getCourseInfo(courseId as string)
          const userCourseProgress = await courseService.getUserCourseProgress(
            user?.id,
            courseId as string
          )
          console.log('userCourseProgress', userCourseProgress)
          console.log('data', data)
          console.log('course', course)
          setUserCourseProgress(userCourseProgress)
          setCourse(data)
          setSortedParts(
            data.parts?.sort((a, b) => a.sortOrder - b.sortOrder) || []
          )
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, user])

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Авторизуйтесь для доступа к курсам
        </h2>
      </div>
    )
  }
  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Button asChild>
          <Link href="/courses">Назад</Link>
        </Button>
      </div>
    )
  }
  const isPartAccessible = (partId: string, index: number) => {
    if (!userCourseProgress) return false
    const completed = userCourseProgress.completedParts || []
    const current = userCourseProgress.currentCoursePartId

    // Проверяем доступность части
    return (
      completed.includes(partId) ||
      partId === current ||
      (index === 0 && !current)
    )
  }

  const getPartStatus = (partId: string, index: number) => {
    if (!userCourseProgress) return 'locked'
    if (userCourseProgress.completedParts?.includes(partId)) return 'completed'
    if (partId === userCourseProgress.currentCoursePartId) return 'current'
    return 'locked'
  }
  const handleStartCourse = async () => {
    if (!userCourseProgress) {
      const newUserCourseProgress =
        await courseService.createUserCourseProgress(
          user?.id,
          courseId as string
        )
      router.push(
        `/courses/${courseId}/${newUserCourseProgress.currentCoursePartId}`
      )
    } else {
      router.push(
        `/courses/${courseId}/${userCourseProgress.currentCoursePartId}`
      )
    }

    console.log('userCourseProgress111', userCourseProgress)
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="text-muted-foreground">
            Продолжительность: {course.duration}h
          </div>
          <div className="text-muted-foreground">
            Части: {course.parts?.length || 0}
          </div>
        </div>

        {course.previewImageUrl && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_STATIC_URL}${course.previewImageUrl}`}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        <div className="flex gap-3 mb-5">
          {course.tags?.map(tag => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-lg text-muted-foreground">{course.description}</p>

        <div className="flex mb-4 mt-10  gap-10 ">
          <Button onClick={handleStartCourse} className="h-10 cursor-pointer">
            {userCourseProgress ? 'Продолжить курс' : 'Начать курс'}
          </Button>
          {userCourseProgress && (
            <div className="flex flex-col  gap-4 ">
              <Progress
                value={userCourseProgress.progress}
                className="h-3 w-[400px]"
              />
              <span className="text-muted-foreground text-sm">
                Пройдено: {userCourseProgress.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {course.prerequisites && (
          <div className="md:w-1/2 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Требования</h3>
            <p className="text-muted-foreground">{course.prerequisites}</p>
          </div>
        )}

        {course.learningObjectives?.length > 0 && (
          <div className="md:w-1/2 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Чему научитесь?</h3>
            <ul className="flex flex-col gap-3">
              {course.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="text-green-500 mt-1">✓</div>
                  <span className="text-muted-foreground">
                    {objective.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative">
        <h2 className="text-3xl font-bold mb-8">Содержание курса</h2>
        <div className="absolute left-8 top-4 bottom-4 w-1 bg-border -z-10" />

        <div className="space-y-12 pl-16">
          {sortedParts.map((part, index) => {
            const status = getPartStatus(part.id, index)
            const isAccessible = isPartAccessible(part.id, index)

            return (
              <div key={part.id} className="relative">
                <div
                  className={`absolute left-[-48px] top-6 w-8 h-8 rounded-full 
                  flex items-center justify-center ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>

                <div className="relative group">
                  {!isAccessible && (
                    <div
                      className="absolute inset-0 bg-background/80 z-10 
                      flex items-center justify-center rounded-lg cursor-not-allowed"
                    >
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  <Link
                    href={
                      isAccessible ? `/courses/${course.id}/${part.id}` : '#'
                    }
                    onClick={e => !isAccessible && e.preventDefault()}
                    className={!isAccessible ? 'cursor-not-allowed' : ''}
                  >
                    <Card
                      className={`max-w-2xl transition-shadow ${
                        isAccessible
                          ? 'hover:shadow-md cursor-pointer'
                          : 'opacity-60'
                      }`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle>{part.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {part.type === CoursePartType.THEORETICAL
                              ? 'Теория'
                              : 'Практика'}
                          </Badge>
                          {status === 'completed' && <Badge>Завершено</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{part.description}</CardDescription>
                        {part.previewImageUrl && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_STATIC_URL}${part.previewImageUrl}`}
                            alt={part.title}
                            className="mt-4 w-full h-48 object-cover rounded-lg bg-muted"
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
