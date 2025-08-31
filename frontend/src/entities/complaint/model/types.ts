export interface ComplaintReview {
  id: string
  createdAt: Date
  complaintType: string
  comment: string
  reviewedUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  reviewerUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  approvedComplaintsCount: number
  reviewPractise: {
    comment: string
    score: number
    reviewer: {
      id: string
      name: string
      email: string
      avatarUrl?: string
    }
    practiceSubmission: {
      part: { title: string }
      user: {
        id: string
        name: string
        email: string
        avatarUrl?: string
      }
    }
    reviewPractiseScoreCriterias: Array<{
      score: number
      reviewCriteria: {
        title: string
        description: string
      }
    }>
  }
}
