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
import { FaEye } from 'react-icons/fa'
import { StandalonePractice } from '@/entities/practise/model/types'
import { CoursePart } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { practiseService } from '@/entities/practise/api/practise.service'
import { set } from 'zod'

export default function Profile() {
  const { user } = useUser()
  const [solutions, setSolutions] = useState<PractiseSolution[]>([])
  const [practisesSolutions, setPractises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPractises, setUserPractises] = useState<
    StandalonePractiseSolution[]
  >([])

  const [usersSolutions, setUsersSolutions] = useState<PractiseSolution[]>([])

  useEffect(() => {
    const loadUserPractises = async () => {
      try {
        if (user?.id) {
          // const courseSolutionssData = await practiseService.getPractisesSolutionsByUserId(
          //   user.id)
          const practisesSolutionsData =
            await practiseSolutionService.getStandalonePractisesSolutionsByUserId(
              user.id
            )
          const data =
            await practiseSolutionService.getPractisesSolutionsByUserId(user.id)
          const usersSolutionsData =
            await practiseSolutionService.getCoursePractisesExceptByUserId(
              user.id
            )
          setUsersSolutions(usersSolutionsData)
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
  }, [user?.id])

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
            <AvatarImage src={`${user?.avatarUrl}`} />
            <AvatarFallback>HP</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex gap-4 items-center">
              <h1 className="text-2xl font-bold">{user?.name}</h1>

              {/* Бейдж с очками за ревью */}
              {typeof user?.reviewsOverCount === 'number' &&
                (user.reviewsOverCount === 0 ? (
                  <div className="flex items-center gap-2 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                    <Star className="w-4 h-4 text-red-500" />0 очков –{' '}
                    <span className="underline">Проверьте другие решения</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    {user.reviewsOverCount} очк.
                  </div>
                ))}

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
          <div className="text-sm text-neutral-300 max-w-sm">{user?.bio}</div>
        </div>
      </div>
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lent">Лента</TabsTrigger>
          <TabsTrigger value="courses">Задания курсов</TabsTrigger>
          <TabsTrigger value="practises">Челленджи</TabsTrigger>
        </TabsList>
        <TabsContent value="lent">
          <div className="p-6">
            <div className=" w-full flex items-center gap-3  bg-neutral-900  text-green-100 px-4 py-3 rounded-xl shadow-sm">
              <Star className="w-5 h-5  text-green-100" />
              <h2 className="text-lg font-semibold">
                Зарабатывайте очки за ревью, чтобы ваше решение могли проверить
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {usersSolutions.slice(0, 6).map(solution => (
              <CourseSolutionCardUser key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="courses">
          <h2 className="text-xl font-semibold p-6">Ваши задания из курсов</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {solutions.slice(0, 6).map(solution => (
              <CourseSolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practises">
          <h2 className="text-xl font-semibold p-6">Ваши челленджи</h2>
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
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-48 w-full overflow-hidden mb-2">
          <img
            src={getImageUrl(solution.imageUrl)}
            alt={solution.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <CardContent solution={solution} />
      </CardHeader>
    </Card>
  )
}

function PractiseSolutionCard({
  solution
}: {
  solution: StandalonePractiseSolution
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-48 w-full overflow-hidden mb-2">
          <img
            src={getImageUrl(solution.imageUrl)}
            alt={solution.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <CardContentStandalone solution={solution} />
      </CardHeader>
    </Card>
  )
}
function CardContentStandalone({
  solution
}: {
  solution: StandalonePractiseSolution
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          <a href={`/practises/${solution.practiseId}`}>{solution.title}</a>
        </CardTitle>
        <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
          {solution.score ? (
            <div>
              <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />

              <span className="text-green-200 font-bold text-xl">
                {solution.score.toFixed(1)}
              </span>
              <span className="text-neutral-500 ml-1">/ 5.0</span>
            </div>
          ) : (
            <p>Не оценено</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
        {solution.description}
      </p>
      <div className="text-xs text-muted-foreground">
        {solution.submittedAt} • {solution.repoUrl}
      </div>
    </>
  )
}

function CardContent({ solution }: { solution: PractiseSolution }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          <a href={`/courses/parts/${solution.partId}`}>{solution.title}</a>
        </CardTitle>
        <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
          {solution.score ? (
            <div>
              <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />

              <span className="text-green-200 font-bold text-xl">
                {solution.score.toFixed(1)}
              </span>
              <span className="text-neutral-500 ml-1">/ 5.0</span>
            </div>
          ) : (
            <p>Не оценено</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
        {solution.description}
      </p>
      <div className="text-xs text-muted-foreground">
        {solution.submittedAt} • {solution.repoUrl}
      </div>
    </>
  )
}

function getImageUrl(imageUrl: string | null) {
  return imageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${imageUrl}`
    : '/placeholder-course.png'
}

function CourseSolutionCardUser({ solution }: { solution: PractiseSolution }) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="h-48 w-full overflow-hidden mb-2">
          <img
            src={getImageUrl(solution.imageUrl)}
            alt={solution.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <CardContentUser solution={solution} />
      </CardHeader>
    </Card>
  )
}

function CardContentUser({ solution }: { solution: PractiseSolution }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          <a href={`/review/${solution.id}`}>{solution.title}</a>
        </CardTitle>
        <div className="flex items-center bg-neutral-950 px-2 py-1 rounded">
          {solution.score ? (
            <div>
              <Star className="w-4 h-4 text-green-200 mr-1 text-xl" />

              <span className="text-green-200 font-bold text-xl">
                {solution.score.toFixed(1)}
              </span>
              <span className="text-neutral-500 ml-1">/ 5.0</span>
            </div>
          ) : (
            <p>Не оценено</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
        {solution.description}
      </p>
      <a href={`/review/${solution.id}`} className="block">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 h-10"
        >
          <FaEye />
          Оценить
        </Button>
      </a>
      <div className="text-xs text-muted-foreground">
        {solution.submittedAt} • {solution.repoUrl}
      </div>
    </>
  )
}
