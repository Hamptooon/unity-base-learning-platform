import { IUser } from '@/entities/user/model/types'
export interface IAuthResponse {
  accessToken: string
  user: IUser
}
