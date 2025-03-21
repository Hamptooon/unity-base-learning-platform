'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/features/auth/provider/user-provider'
import { authTokenService } from '@/shared/api/auth-token.service'
import { axiosWithAuth } from '@/shared/api/axios'
import { toast } from 'react-toastify'
import { authService } from '@/features/auth/api/auth.service'

export default async function RefreshToken() {
  const router = useRouter()
  const { setUser } = useUser() // Получаем setUser из контекста

  try {
    await authTokenService.getNewTokens()
    router.push('/')
  } catch (error) {
    authTokenService.removeFromStorage()
  }

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">Авторизация...</h1>
      <p>Пожалуйста, подождите</p>
    </div>
  )
}
