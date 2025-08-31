import {
  FiChevronLeft,
  FiHome,
  FiSettings,
  FiUsers,
  FiMenu,
  FiBook
} from 'react-icons/fi'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/shared/ui/sidebar'
import { MdArticle } from 'react-icons/md'
import { FaExclamationTriangle } from 'react-icons/fa'

import { BsLightning } from 'react-icons/bs'
const items = [
  {
    title: 'Главная',
    path: '/admin',
    icon: FiHome
  },
  {
    title: 'Курсы',
    path: '/admin/courses',
    icon: FiBook
  },
  {
    title: 'Пользователи',
    path: '/admin/users',
    icon: FiUsers
  },
  {
    title: 'Настройки',
    path: '/admin/settings',
    icon: FiSettings
  },
  {
    title: 'Жалобы',
    path: '/admin/complaints',
    icon: FaExclamationTriangle
  },
  {
    title: 'Статьи',
    path: '/admin/articles',
    icon: MdArticle
  },
  {
    title: 'Челленджи',
    path: '/admin/practises',
    icon: BsLightning
  }
]

export function AppSidebar() {
  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Админ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      key={item.path}
                      href={item.path}
                      className="flex items-center gap-4 font-bold"
                    >
                      <item.icon className="h-30 w-30" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
