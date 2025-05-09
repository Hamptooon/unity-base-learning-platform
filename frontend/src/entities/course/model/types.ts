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
