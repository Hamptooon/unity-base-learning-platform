'use client'
import { Skeleton } from '@/shared/ui/skeleton'

import { Course } from '@/entities/course/model/types'

import { CourseCard } from '@/entities/course/ui/admin/course-card'

interface CourseListProps {
  courses: Course[]
  loading: boolean
  error: string
  onDeleteCourse: (courseId: string) => void
}
export const CourseList = ({
  courses,
  loading,
  error,
  onDeleteCourse
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => {
        return (
          <CourseCard
            key={course.id}
            course={course}
            onDelete={onDeleteCourse}
          />
        )
      })}
    </div>
  )
}
