'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/features/auth/provider/user-provider'
import { authTokenService } from '@/shared/api/auth-token.service'
import { axiosWithAuth } from '@/shared/api/axios'
import { toast } from 'react-toastify'
import { authService } from '@/features/auth/api/auth.service'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { setUser } = useUser() // Получаем setUser из контекста

  useEffect(() => {
    const saveTokenAndRedirect = async () => {
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('accessToken')

      if (accessToken) {
        authTokenService.saveTokenStorage(accessToken)

        const data = await authService.getCurrentUser()
        if (data) {
          const userData = data
          setUser(userData)
          if (userData.emailVerified) {
            toast.success('Вы успешно авторизовались')
          } else {
            toast.info(
              'Вы успешно авторизовались. Подтвердите почту, письмо направлено на адрес ' +
                userData.email +
                ' или запросите письмо повторно в настройках профиля'
            )
          }
        } else {
          toast.error('Ошибка при получении данных пользователя')
        }
      } else {
        toast.error('Ошибка при получении данных пользователя')
      }
      router.push('/')
    }

    saveTokenAndRedirect()
  }, [router, setUser])

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">Авторизация...</h1>
      <p>Пожалуйста, подождите</p>
    </div>
  )
}
