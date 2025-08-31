'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'
import { IoSettingsOutline } from 'react-icons/io5'
import { useUser } from '@/features/auth/provider/user-provider'
import { Star } from 'lucide-react'
import { practiseSolutionService } from '@/entities/practise-solution/api/practise-solution.service'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  PractiseSolution,
  StandalonePractiseSolution
} from '@/entities/practise-solution/model/types'
import { StandalonePractice } from '@/entities/practise/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { practiseService } from '@/entities/practise/api/practise.service'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { IUser } from '@/entities/user/model/types'
import { userService } from '@/entities/user/api/user.service'
import { FaEye } from 'react-icons/fa'
export default function Profile() {
  const { user } = useUser()
  const { 'profile-id': profileId } = useParams()
  const [solutions, setSolutions] = useState<PractiseSolution[]>([])
  const [practisesSolutions, setPractises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPractises, setUserPractises] = useState<
    StandalonePractiseSolution[]
  >([])
  const [userProfile, setUserProfile] = useState<IUser | null>(null)
  const router = useRouter()
  useEffect(() => {
    const loadUserPractises = async () => {
      try {
        if (user?.id && profileId) {
          if (user.id == profileId) {
            router.replace('/profile')
          }

          const userData = await userService.getUserById(profileId as string)
          setUserProfile(userData)
          // const courseSolutionssData = await practiseService.getPractisesSolutionsByUserId(
          //   user.id)
          const practisesSolutionsData =
            await practiseSolutionService.getStandalonePractisesSolutionsByUserId(
              profileId as string
            )
          const data =
            await practiseSolutionService.getPractisesSolutionsByUserId(
              profileId as string
            )
          setSolutions(data)
          setUserPractises(practisesSolutionsData)
        }
      } catch (err) {
        setError('Не удалось загрузить решения')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadUserPractises()
  }, [user?.id, profileId, router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="max-w-7xl mx-auto p-10 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-10">
      {/* Шапка профиля */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`${userProfile?.avatarUrl}`} />
            <AvatarFallback>HP</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex gap-4 items-center">
              <h1 className="text-2xl font-bold">{userProfile?.name}</h1>
            </div>
            <p className="text-muted-foreground">@{userProfile?.name}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-x text-neutral-300">{userProfile?.bio}</div>
        </div>
      </div>
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Задания курсов</TabsTrigger>
          <TabsTrigger value="practises">Челленджи</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <h2 className="text-xl font-semibold p-6">Задания из курсов</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {solutions.slice(0, 6).map(solution => (
              <CourseSolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practises">
          <h2 className="text-xl font-semibold p-6">Челленджи</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {userPractises.slice(0, 6).map(solution => (
              <PractiseSolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseSolutionCard({ solution }: { solution: PractiseSolution }) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
      <div className="h-48 w-full overflow-hidden p-4">
        <img
          src={getImageUrl(solution.imageUrl)}
          alt={solution.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between p-4">
        <CardContent solution={solution} />
      </div>
    </Card>
  )
}

function PractiseSolutionCard({
  solution
}: {
  solution: StandalonePractiseSolution
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
      <div className="h-48 w-full overflow-hidden p-4">
        <img
          src={getImageUrl(solution.imageUrl)}
          alt={solution.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between p-4">
        <CardContentStandalone solution={solution} />
      </div>
    </Card>
  )
}

function CardContentStandalone({
  solution
}: {
  solution: StandalonePractiseSolution
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Заголовок + оценка */}
      <div className="flex items-center justify-between mb-2">
        <CardTitle className="text-lg">
          <div>{solution.title}</div>
        </CardTitle>
        <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
          {solution.score ? (
            <>
              <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />
              <span className="text-green-200 font-bold text-xl">
                {solution.score.toFixed(1)}
              </span>
              <span className="text-neutral-500 ml-1">/ 5.0</span>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Не оценено</p>
          )}
        </div>
      </div>

      {/* Описание */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {solution.description}
      </p>

      {/* Spacer + кнопка + футер */}
      <div className="mt-auto space-y-2">
        <a href={`#`} className="block">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-10"
          >
            <FaEye />
            Оценить
          </Button>
        </a>
        <div className="text-xs text-muted-foreground text-left">
          {solution.submittedAt} • {solution.repoUrl}
        </div>
      </div>
    </div>
  )
}

function CardContent({ solution }: { solution: PractiseSolution }) {
  return (
    <div className="flex flex-col h-full">
      {/* Заголовок + оценка */}
      <div className="flex items-center justify-between mb-2">
        <CardTitle className="text-lg">
          <div>{solution.title}</div>
        </CardTitle>
        <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
          {solution.score ? (
            <>
              <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />
              <span className="text-green-200 font-bold text-xl">
                {solution.score.toFixed(1)}
              </span>
              <span className="text-neutral-500 ml-1">/ 5.0</span>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Не оценено</p>
          )}
        </div>
      </div>

      {/* Описание */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {solution.description}
      </p>

      {/* Spacer + кнопка + футер */}
      <div className="mt-auto space-y-2">
        <a href={`/review/${solution.id}`} className="block">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-10"
          >
            <FaEye />
            Оценить
          </Button>
        </a>
        <div className="text-xs text-muted-foreground text-left">
          {solution.submittedAt} • {solution.repoUrl}
        </div>
      </div>
    </div>
  )
}

function getImageUrl(imageUrl: string | null) {
  return imageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${imageUrl}`
    : '/placeholder-course.png'
}
