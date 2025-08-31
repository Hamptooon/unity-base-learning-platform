'use client'
import { cn } from '@/shared/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  FiChevronLeft,
  FiHome,
  FiSettings,
  FiUsers,
  FiMenu,
  FiBook
} from 'react-icons/fi'
import { MdArticle } from 'react-icons/md'
import { BsLightning } from 'react-icons/bs'
import { FaExclamationTriangle } from 'react-icons/fa'

interface SidebarProps {
  isOpen: boolean
  isMobile: boolean
  onToggle: () => void
}

export const Sidebar = ({ isOpen, isMobile, onToggle }: SidebarProps) => {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const navItems = [
    { href: '/admin', label: 'Главная', icon: FiHome },
    { href: '/admin/users', label: 'Пользователи', icon: FiUsers },
    { href: '/admin/settings', label: 'Настройки', icon: FiSettings },
    { href: '/admin/complaints', label: 'Жалобы', icon: FaExclamationTriangle },
    { href: '/admin/courses', label: 'Курсы', icon: FiBook },
    { href: 'admin/articles', label: 'Статьи', icon: MdArticle },
    { href: 'admin/challenges', label: 'Челленджи', icon: BsLightning }
  ]

  return (
    <motion.nav
      className={cn(
        'fixed md:relative left-0 top-0 h-full shadow-lg z-50',
        isMobile ? 'w-64' : 'w-64'
      )}
      animate={{
        width: isOpen ? 250 : isMobile ? 0 : 80,
        opacity: isOpen || !isMobile ? 1 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold dark:text-white">Админпанель</h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {isOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <div className="mt-6">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center p-4 mx-2 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'hover:bg-gray-800 dark:hover:bg-gray-700'
                )}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* {hoveredItem === item.href && (
                  <motion.div
                    className="absolute inset-0 bg-gray-800 opacity-5 dark:bg-gray-700 rounded-lg"
                    layoutId="hover-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )} */}

                <Icon
                  className={cn(
                    'flex-shrink-0',
                    isActive
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                  size={24}
                />

                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3 font-medium dark:text-white"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
