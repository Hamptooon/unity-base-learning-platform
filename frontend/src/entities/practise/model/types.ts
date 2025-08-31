// types.ts
import { Difficulty } from '@/entities/course/model/types'
import { Tag } from '@/entities/tag/model/types'
export type StandalonePractice = {
  id: string
  title: string
  description: string
  content: string
  previewImageUrl: string
  assetsFileUrl: string
  difficulty: Difficulty
  duration: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
  reviewCriteria: StandalonePractiseCriteria[]
  submissions: StandalonePracticeSubmission[]
}
export interface CreatePractise {
  title: string
  description: string
}
export type UpdatePractise = Partial<StandalonePractice>
export type StandalonePractiseCriteria = {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  practiceId: string
}

export type StandalonePracticeSubmission = {
  id: string
  userId: string
  practiceId: string
  githubRepo: string
  githubPagesUrl: string
  challenges: string | null
  learned: string | null
  isReviewed: boolean
  canReviewed: boolean
  score: number | null
  createdAt: Date
  updatedAt: Date
}

// Для фильтрации в хуке usePractices
export type PracticeFilterParams = {
  page?: number
  limit?: number
  search?: string
  tags?: string
  difficulty?: Difficulty | 'all'
  status?: 'published' | 'draft' | 'all'
  sortOrder?: 'asc' | 'desc'
}

// Для форм создания/редактирования
export type PracticeFormValues = {
  title: string
  description: string
  content?: string
  previewImage?: File | null
  assetsFile?: File | null
  difficulty: Difficulty
  duration: number
  tags: string[]
  criteria?: CriteriaFormValue[]
  isPublished?: boolean
}

export type CriteriaFormValue = {
  title: string
  description: string
}

// Для ответов API
export type PracticesResponse = {
  practices: StandalonePractice[]
  total: number
}

export type PracticeResponse = {
  practice: StandalonePractice
}
