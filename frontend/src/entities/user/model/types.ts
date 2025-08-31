export interface IUser {
  id: string
  name: string
  email: string
  role: string
  bio: string
  avatarUrl: string
  emailVerified: boolean
  emailVerificationToken: string
  avatar: string
  reviewsOverCount: number
}

export interface PracticeSubmission {
  id: string
  githubRepo: string
  githubPagesUrl: string
  challenges?: string
  learned?: string
  userId: string
  partId: string
  canReviewed: boolean
  isReviewed: boolean
  createdAt: string
  updatedAt: string
  user: IUser
}
