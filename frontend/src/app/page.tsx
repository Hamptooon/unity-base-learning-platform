'use client'
import { useUser } from '@/features/auth/provider/user-provider'

export default function Home() {
  const { user, isLoading } = useUser()
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Главная страница</h1>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : user ? (
        <div className="space-y-4">Вход выполнен как {user.email}</div>
      ) : (
        <p>Пожалуйста, войдите для просмотра контента</p>
      )}
    </div>
  )
}
