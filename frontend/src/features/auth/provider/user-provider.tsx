// features/auth/provider/user-provider.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import { authService } from '@/features/auth/api/auth.service'
import { IUser } from '@/entities/user/model/types'
import { Sidebar } from '@/widgets/admin-sidebar/admin-sidebar'
import { motion } from 'framer-motion'
import { SidebarProvider, SidebarTrigger } from '@/shared/ui/sidebar'
import { AppSidebar } from '@/widgets/admin-sidebar/app-sidebar'
import Header from '@/widgets/header/header'
interface UserContextType {
  user: IUser | null
  isLoading: boolean
  setUser: (user: IUser | null) => void
  refetchUser: () => Promise<void> // Добавляем функцию для перезагрузки данных
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Выносим логику загрузки в отдельную функцию
  const fetchUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Функция для принудительной перезагрузки данных
  const refetchUser = useCallback(async () => {
    setIsLoading(true)
    await fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider value={{ user, isLoading, setUser, refetchUser }}>
      {user?.role === 'ADMIN' ? (
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 overflow-y-auto relative">
            <Header /> {/* Добавляем Header сюда */}
            {children}
          </main>
        </SidebarProvider>
      ) : (
        <div>
          <Header /> {/* И сюда */}
          <main className="">{children}</main>
        </div>
      )}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
