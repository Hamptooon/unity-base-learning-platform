import { Tag } from '@/entities/tag/model/types'
export interface Course {
  id: string
  title: string
  description: string
  previewImageUrl?: string
  prerequisites?: string
  duration: number
  difficulty: Difficulty
  learningObjectives?: LearningObjective[]
  parts?: CoursePart[]
  tags?: Tag[]
  isPublished: boolean
}

export type CourseUpdate = Partial<Course>

export interface LearningObjective {
  id?: string
  description: string
}
export enum Difficulty {
  NEWBIE = 'NEWBIE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface CourseArticle {
  id?: string
  content?: string
}
export interface CoursePractice {
  id?: string
  content?: string
  assetsFileUrl?: string
}
export enum CoursePartType {
  THEORETICAL = 'THEORETICAL',
  PRACTICAL = 'PRACTICAL'
}
export interface CoursePartLocal extends CoursePart {
  isOpen: boolean
}

export interface CourseUserProgress {
  progress: number
  completedParts: string[]
  currentCoursePartId: string
}

export interface CoursePart {
  id?: string
  type: CoursePartType
  sortOrder: number
  title: string
  courseId: string
  description: string
  previewImageUrl?: string
  courseArticleId?: string
  coursePracticeTaskId?: string
  article?: CourseArticle
  practice?: CoursePractice
}

export interface ReviewCriteria {
  id: string
  description: string
  title: string
  coursePracticeTaskId: string
}

// тип для создания курса
export interface CreateCourseMainInfo {
  title: string
  description: string
  previewImageUrl?: string | null
}

export interface CreateCoursePart {
  type: CoursePartType
  title: string
  description: string
  sortOrder: number
}

export interface PractiseInfo {
  id: string
  title: string
  description: string
  previewImageUrl?: string
  content: string
  assetsFileUrl?: string
  reviewCriterias: ReviewCriteria[]
}

// id: review.id,
// 			reviewer: {
// 				userId: review.reviewer.id,
// 				name: review.reviewer.name,
// 				avatarUrl: review.reviewer.avatarUrl
// 			},
// 			score: review.score,
// 			comment: review.comment,
// 			reviewPractiseScoreCriterias: review.reviewPractiseScoreCriterias.map(
// 				criteria => ({
// 					score: criteria.score,
// 					reviewCriteriaTitle: criteria.reviewCriteria.title,
// 					reviewCriteriaDescription: criteria.reviewCriteria.description
// 				})
// 			),
// 			createdAt: review.createdAt
export interface ReviewsInfo {
  id: string
  reviewer: {
    userId: string
    name: string
    avatarUrl: string
  }
  score: number
  comment: string
  reviewPractiseScoreCriterias: {
    id: string
    score: number
    reviewCriteriaTitle: string
    reviewCriteriaDescription: string
  }[]
  createdAt: string
}
