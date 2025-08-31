import { Tag } from '@/entities/tag/model/types'
export interface Article {
  id: string
  title: string
  description: string
  previewImageUrl: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  content: string
  tags: Tag[]
}

export interface CreateArticle {
  title: string
  description: string
}

export type UpdateArticle = Partial<Article>
