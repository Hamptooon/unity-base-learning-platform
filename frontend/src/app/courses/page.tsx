'use client'
import { useEffect, useState } from 'react'
import { Course, Difficulty } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import Link from 'next/link'
export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getCourses()
        console.log(data)
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const getDifficultyVariant = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.NEWBIE:
        return 'secondary'
      case Difficulty.BEGINNER:
        return 'default'
      case Difficulty.INTERMEDIATE:
        return 'outline'
      case Difficulty.ADVANCED:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <div className="relative h-96 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/demoVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-5xl font-bold  mb-6 ">Unity Learning Paths</h1>
            <p className="text-xl text-muted-foreground">
              Наши обучающие программы помогут вам шаг за шагом улучшить навыки
              разработки в Unity. Освойте ключевые темы создания игр и
              приложений, чтобы стать опытным разработчиком.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
              const imagePath = course.previewImageUrl
                ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${course.previewImageUrl}`
                : '/placeholder-course.png'

              return (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow h-full flex flex-col p-0"
                >
                  <CardHeader className="p-0 relative">
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={imagePath}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <Badge
                      variant={getDifficultyVariant(course.difficulty)}
                      className="absolute top-2 left-2"
                    >
                      {course.difficulty}
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex-1 pt-6 pb-4">
                    <CardTitle className="mb-2 line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mb-4">
                      {course.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-muted-foreground">
                        Продолжительность: {course.duration}h
                      </span>
                      <Button asChild>
                        <Link href={`/courses/${course.id}`}>Посмотреть</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
