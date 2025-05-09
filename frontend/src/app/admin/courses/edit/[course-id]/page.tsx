'use client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { axiosWithAuth } from '@/shared/api/axios'
import { EditCourseForm } from '@/features/admin/course/edit-course/ui/edit-course-form'

const EditCourse = () => {
  return (
    <div>
      <EditCourseForm />
    </div>
  )
}

export default EditCourse
