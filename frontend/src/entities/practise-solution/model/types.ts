export type PractiseSolution = {
  id: string
  title: string
  partId: string
  description: string
  imageUrl: string | null
  score: number | null
  submittedAt: string
  repoUrl: string
}

export interface StandalonePractiseSolution {
  id: string
  title: string
  practiseId: string
  description: string
  imageUrl: string | null
  score: number | null
  submittedAt: string
  repoUrl: string
}
