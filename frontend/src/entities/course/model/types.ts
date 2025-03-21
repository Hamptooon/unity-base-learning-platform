export interface ICourse {
  title: string
  description: string
  previewImageUrl: string
  prerequisites: string
  duration: number
  difficulty: Difficulty
  objectives: IAddObjective[]
}
export interface IAddObjective {
  description: string
}
export enum Difficulty {
  NEWBIE = 'NEWBIE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}
