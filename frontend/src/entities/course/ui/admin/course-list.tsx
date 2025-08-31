'use client'
import { Skeleton } from '@/shared/ui/skeleton'

import { Course } from '@/entities/course/model/types'

import { CourseCard } from '@/entities/course/ui/admin/course-card'

interface CourseListProps {
  courses: Course[]
  loading: boolean
  error: string
  onDeleteCourse: (courseId: string) => void
  onPublishCourse: (courseId: string) => void
  onHideCourse: (courseId: string) => void
}
export const CourseList = ({
  courses,
  loading,
  error,
  onDeleteCourse,
  onPublishCourse,
  onHideCourse
}: CourseListProps) => {
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  } else if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }
  if (courses.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        <p className="text-lg font-medium">😕 Курсы не найдены</p>
        <p className="mt-2 text-sm">
          Попробуйте изменить фильтры или вернитесь позже.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => {
        return (
          <CourseCard
            key={course.id}
            course={course}
            onDelete={onDeleteCourse}
            onPublish={onPublishCourse}
            onHide={onHideCourse}
          />
        )
      })}
    </div>
  )
}
