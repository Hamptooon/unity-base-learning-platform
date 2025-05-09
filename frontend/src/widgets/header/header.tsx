'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '@/features/auth/provider/user-provider'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { authService } from '@/features/auth/api/auth.service'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/shared/ui/sidebar'
// import { useTheme } from '@/shared/lib/theme'

export default function Header() {
  const { user, isLoading, setUser } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  // const { theme, toggleTheme } = useTheme()

  const menuLinks = [
    { href: '/profile', label: 'Профиль' },
    { href: '/user-settings', label: 'Настройки' },
    { href: '/notifications', label: 'Уведомления' }
  ]
  const adminMenuLinks = [
    ...menuLinks,
    { href: '/admin', label: 'Админ панель' }
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
    toast.success('Вы успешно вышли')
    router.push('/')
  }
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.user-menu')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="border-b">
      <nav className="  p-4 flex justify-between  items-center border">
        <div className="flex gap-4 items-center">
          {user?.role === 'ADMIN' && <SidebarTrigger />}
          <Link href="/" className="text-xl font-bold dark:text-white">
            <Image
              src="/icon-platform.svg"
              alt="Логотип"
              width={150}
              height={150}
              unoptimized // SVG не требует оптимизации
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-10">
            <Link
              href="/courses"
              className="hidden md:flex items-center gap-2 text-neutral-300 hover:text-neutral-100 rounded-full p-2 transition-colors"
            >
              Курсы
            </Link>
            <Link
              href="/articles"
              className="hidden md:flex items-center gap-2 text-neutral-300 hover:text-neutral-100 rounded-full p-2 transition-colors"
            >
              Статьи
            </Link>
            <Link
              href="/challenges"
              className="hidden md:flex items-center gap-2 text-neutral-300 hover:text-neutral-100 rounded-full p-2 transition-colors"
            >
              Челленджи
            </Link>
            <Link
              href="/about"
              className="hidden md:flex items-center gap-2 text-neutral-300 hover:text-neutral-100 rounded-full p-2 transition-colors"
            >
              О нас
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : user ? (
            <div className="relative user-menu">
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-800 rounded-full p-2 transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-15 h-15 rounded-full"
                />
                <motion.svg
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  className="w-5 h-5 fill-current dark:text-black"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-[1001]"
                  >
                    {user.role === 'ADMIN'
                      ? adminMenuLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-black"
                          >
                            {link.label}
                          </Link>
                        ))
                      : menuLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-black"
                          >
                            {link.label}
                          </Link>
                        ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white  text-black"
                    >
                      Выйти
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild>
              <Link href="/api/auth/github">Войти с GitHub</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
