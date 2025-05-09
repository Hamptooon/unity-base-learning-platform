import Cookies from 'js-cookie'
import { axiosWithAuth } from '@/shared/api/axios'
import { IUser } from '@/entities/user/model/types'
import { Course } from '@/entities/course/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { CourseUserProgress } from '@/entities/course/model/types'
import { PracticeSubmission } from '@/entities/user/model/types'
import {
  ReviewCriteria,
  CreateCourseMainInfo,
  CreateCoursePart
} from '@/entities/course/model/types'
export const courseService = {
  async createCourseInfo(data: Course): Promise<Course> {
    const response = await axiosWithAuth.post<Course>('/courses', data)
    return response.data
  },

  async createCourseMainInfo(data: CreateCourseMainInfo): Promise<Course> {
    const response = await axiosWithAuth.post<Course>('/courses', data)
    return response.data
  },
  async getCourseInfo(courseId: string): Promise<Course> {
    const response = await axiosWithAuth.get<Course>(`/courses/${courseId}`)
    return response.data
  },
  async updateCourseInfo(courseId: string, data: Course): Promise<Course> {
    const response = await axiosWithAuth.put<Course>(
      `/courses/${courseId}`,
      data
    )
    return response.data
  },
  async createCoursePart(
    courseId: string,
    data: CreateCoursePart
  ): Promise<CoursePart> {
    const response = await axiosWithAuth.post<CoursePart>(
      `/courses/${courseId}/parts`,
      data
    )
    return response.data
  },
  async deleteCoursePart(
    courseId: string,
    partId: string
  ): Promise<CoursePart> {
    const response = await axiosWithAuth.delete<CoursePart>(
      `/courses/${courseId}/parts/${partId}`
    )
    return response.data
  },

  async getCourseParts(courseId: string): Promise<CoursePart[]> {
    const response = await axiosWithAuth.get<CoursePart[]>(
      `/courses/${courseId}/parts`
    )
    return response.data
  },

  async getCourses(): Promise<Course[]> {
    const response = await axiosWithAuth.get<Course[]>('/courses')
    return response.data
  },

  async getCoursePart(coursePartId: string): Promise<CoursePart> {
    const response = await axiosWithAuth.get<CoursePart>(
      `/courses/parts/${coursePartId}`
    )
    return response.data
  },
  async deleteCourse(courseId: string): Promise<void> {
    const response = await axiosWithAuth.delete<void>(`/courses/${courseId}`)
    return response.data
  },
  async getUserCourseProgress(
    userId: string,
    courseId: string
  ): Promise<CourseUserProgress> {
    const response = await axiosWithAuth.get<CourseUserProgress>(
      `user-progress/${userId}/courses/${courseId}`
    )
    return response.data
  },
  async createUserCourseProgress(
    userId: string,
    courseId: string
  ): Promise<CourseUserProgress> {
    const response = await axiosWithAuth.post<CourseUserProgress>(
      `user-progress/${userId}/courses/${courseId}`
    )
    return response.data
  },
  async completePart(userId: string, courseId: string, partId: string) {
    const response = await axiosWithAuth.post<CourseUserProgress>(
      `/user-progress/${userId}/complete-part/${courseId}/${partId}`
    )
    return response.data
  },
  async submitPractice(data: PracticeSubmission) {
    const response = await axiosWithAuth.post<PracticeSubmission>(
      '/submissions',
      data
    )
    return response.data
  },

  async getSubmission(userId: string, partId: string) {
    // const response = await fetch(`/api/submissions/user/${userId}/part/${partId}`);
    const response = await axiosWithAuth.get<PracticeSubmission>(
      `/submissions/user/${userId}/part/${partId}`
    )
    return response.data
  },
  async createReviewCriteria(
    courseId: string,
    partId: string,
    practiseId: string,
    data: ReviewCriteria
  ) {
    const response = await axiosWithAuth.post<ReviewCriteria>(
      `/courses/${courseId}/parts/${partId}/${practiseId}/reviews-criterias`,
      data
    )
    return response.data
  },

  async updateReviewCriteria(
    courseId: string,
    partId: string,
    practiseId: string,
    criteriaId: string,
    data: ReviewCriteria
  ) {
    const response = await axiosWithAuth.put<ReviewCriteria>(
      `/courses/${courseId}/parts/${partId}/${practiseId}/reviews-criterias/${criteriaId}`,
      data
    )
    return response.data
  },

  async getReviewCriterias(
    courseId: string,
    partId: string,
    practiseId: string
  ) {
    const response = await axiosWithAuth.get<ReviewCriteria[]>(
      `/courses/${courseId}/parts/${partId}/${practiseId}/reviews-criterias`
    )
    return response.data
  },

  async deleteReviewCriteria(
    courseId: string,
    partId: string,
    practiseId: string,
    criteriaId: string
  ) {
    const response = await axiosWithAuth.delete(
      `/courses/${courseId}/parts/${partId}/${practiseId}/reviews-criterias/${criteriaId}`
    )
    return response.data
  }
}
