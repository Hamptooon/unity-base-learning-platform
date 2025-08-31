export enum ComplaintReviewType {
  ABUSE = 'ABUSE',
  INCORRECTRATE = 'INCORRECTRATE'
}
export interface ComplaintReview {
  reviewerUserId: string
  comment: string
  complaintReviewType: ComplaintReviewType
}
