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

export default function Header() {
  const { user, isLoading, setUser } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const menuLinks = [
    { href: '/profile', label: 'Профиль' },
    { href: '/user-settings', label: 'Настройки' },
    { href: '/notifications', label: 'Уведомления' }
  ]

  const adminMenuLinks = [...menuLinks]

  const navigationLinks = [
    { href: '/courses', label: 'Курсы' },
    { href: '/articles', label: 'Статьи' },
    { href: '/practises', label: 'Челленджи' },
    { href: '/about', label: 'О нас' }
  ]

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
    toast.success('Вы успешно вышли')
    router.push('/')
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (
        !target.closest('.user-menu') &&
        !target.closest('.mobile-menu') &&
        !target.closest('.mobile-menu-trigger') // Добавляем проверку на триггер
      ) {
        setIsMenuOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <header className="border-b">
      <nav className="p-4 flex justify-between items-center border">
        <div className="flex gap-4 items-center">
          {user?.role === 'ADMIN' && <SidebarTrigger />}
          <Link href="/" className="text-xl font-bold dark:text-white">
            <Image
              src="/icon-platform.svg"
              alt="Логотип"
              width={150}
              height={150}
              unoptimized
            />
          </Link>
        </div>

        {/* Мобильное меню */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mobile-menu-trigger"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Десктопное меню */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4 mr-10">
            {navigationLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-neutral-300 hover:text-neutral-100 rounded-full p-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Остальная часть меню пользователя... */}
        </div>

        {/* Мобильное выпадающее меню */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed top-16 left-0 right-0 bg-neutral-800 shadow-lg z-[1000] mobile-menu"
            >
              <div className="flex flex-col p-4">
                {navigationLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Остальная часть меню пользователя... */}
        <div className="flex items-center gap-4">
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
