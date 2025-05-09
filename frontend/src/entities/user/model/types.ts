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
}

export interface PracticeSubmission {
  id: string
  githubRepo: string
  challenges?: string
  learned?: string
  userId: string
  partId: string
  createdAt: string
  updatedAt: string
  user: IUser
  reviewsTargets: string[]
}
