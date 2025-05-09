'use client'
import { SearchBar } from '@/shared/ui/search-bar'
import { useState } from 'react'
import { CourseList } from '@/entities/course/ui/admin/course-list'
import { useCourses } from '@/entities/course/model/use-courses'
import CreateCourseModal from '@/features/admin/course/create/ui/create-course-modal'
export default function Courses() {
  const [searchValue, setSearchValue] = useState('')
  const { courses, loading, error, setCourses, deleteCourse } = useCourses()
  const handleSearch = (value: string) => {
    console.log('Performing search for:', value)
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
        <CreateCourseModal />
      </div>

      <CourseList
        courses={courses}
        loading={loading}
        error={error}
        onDeleteCourse={deleteCourse}
      />
    </div>
  )
}
