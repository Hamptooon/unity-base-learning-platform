'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { IoSettingsOutline } from 'react-icons/io5'
import { useUser } from '@/features/auth/provider/user-provider'
import { Star } from 'lucide-react'
// Временные данные для примера
const mockSolutions = [
  {
    title: 'Responsive preview card component',
    score: 4.8,
    date: '1 month ago',
    repo: 'soldaten/main',
    description: 'Адаптивная карточка с использованием CSS Grid',
    imageUrl: null
  },
  {
    title: 'Dark mode toggle',
    score: 4.5,
    date: '2 weeks ago',
    repo: 'soldaten/main',
    description: 'Переключатель темной и светлой темы с использованием CSS',
    imageUrl: null
  },
  {
    title: 'Custom scrollbar styles',
    score: 4.7,
    date: '3 days ago',
    repo: 'soldaten/main',
    description: 'Пользовательские стили для прокрутки с использованием CSS',
    imageUrl: null
  },
  {
    title: 'Responsive preview card component',
    score: 4.8,
    date: '1 month ago',
    repo: 'soldaten/main',
    description: 'Адаптивная карточка с использованием CSS Grid',
    imageUrl: null
  },
  {
    title: 'Dark mode toggle',
    score: 4.5,
    date: '2 weeks ago',
    repo: 'soldaten/main',
    description: 'Переключатель темной и светлой темы с использованием CSS',
    imageUrl: null
  },
  {
    title: 'Custom scrollbar styles',
    score: 4.7,
    date: '3 days ago',
    repo: 'soldaten/main',
    description: 'Пользовательские стили для прокрутки с использованием CSS',
    imageUrl: null
  }
  // Добавьте еще 3 элемента для примера
]

export default function Profile() {
  const { user } = useUser()

  return (
    <div className="max-w-7xl mx-auto p-10">
      {/* Шапка профиля */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`${user?.avatarUrl}`} />
            <AvatarFallback>HP</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex gap-4 items-center">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <Button variant="outline" className="mt-2">
                <a
                  href="/user-settings"
                  className="w-3 flex items-center justify-center"
                >
                  <IoSettingsOutline />
                </a>
              </Button>
            </div>
            <p className="text-muted-foreground">@{user?.name}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-x text-neutral-300">{user?.bio}</div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="solutions">Мои решения</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <h2 className="text-xl font-semibold p-6">Последние решения</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {mockSolutions.slice(0, 6).map((solution, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="h-48 w-full overflow-hidden mb-2">
                    <img
                      src={
                        solution.imageUrl
                          ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${solution.imageUrl}`
                          : '/placeholder-course.png'
                      }
                      alt={solution.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{solution.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />
                        <span className="text-green-200 font-bold text-xl">
                          {solution.score.toFixed(1)}
                        </span>
                        <span className="text-neutral-500 ml-1">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {solution.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {solution.date} • {solution.repo}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Контент Solutions */}
        <TabsContent value="solutions">
          <h2 className="text-xl font-semibold p-6">Все решения</h2>
          <div className="space-y-6 mt-4">
            {mockSolutions.map((solution, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="flex">
                  <div className="w-32 flex-shrink-0">
                    <img
                      src={
                        solution.imageUrl
                          ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${solution.imageUrl}`
                          : '/placeholder-course.png'
                      }
                      alt={solution.title}
                      className="w-full h-full object-cover rounded-lg p-2"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">
                        {solution.title}
                      </CardTitle>
                      <div className="flex items-center bg-black/80 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 font-bold">
                          {solution.score.toFixed(1)}
                        </span>
                        <span className="text-white/70 ml-1">/ 5.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {solution.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {solution.date} • {solution.repo}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
