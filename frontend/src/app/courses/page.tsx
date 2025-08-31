'use client'
import { useEffect, useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useCourses } from '@/entities/course/model/use-courses'
import { Course, Difficulty } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/shared/ui/pagination'
import { SearchBar } from '@/shared/ui/search-bar'
import { Slider } from '@/shared/ui/slider'
import { useTags } from '@/entities/tag/model/use-tags'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import Link from 'next/link'
import { getDifficultyColor } from '@/shared/utils/functions'
export default function CoursesPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<'published'>('published')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>(
    'all'
  )
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 100])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { tags: allTags } = useTags('course')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  // Мемоизируем параметры запроса
  const requestParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter == 'published' ? statusFilter : undefined,
      difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      durationMin: durationRange[0],
      durationMax: durationRange[1],
      search: searchValue,
      tags: selectedTags.join(',') || undefined, // <--- добавили
      sortOrder: sortOrder
    }),
    [
      page,
      limit,
      statusFilter,
      difficultyFilter,
      durationRange,
      searchValue,
      selectedTags,
      sortOrder
    ]
  )

  const { courses, total, loading, error } = useCourses(requestParams)

  // Оптимизированный обработчик поиска
  const handleSearch = useDebouncedCallback((value: string) => {
    setPage(1)
    setSearchValue(value)
  }, 500)

  const handleResetFilters = () => {
    setPage(1)
    setStatusFilter('published')
    setDifficultyFilter('all')
    setDurationRange([0, 100])
    setSearchValue('')
    setSelectedTags([])
    setSortOrder('desc')
  }

  const totalPages = Math.ceil(total / limit)

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <div className="relative h-96 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/demoVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-5xl font-bold  mb-6 ">Unity Learning Paths</h1>
            <p className="text-xl text-muted-foreground">
              Наши обучающие программы помогут вам шаг за шагом улучшить навыки
              разработки в Unity. Освойте ключевые темы создания игр и
              приложений, чтобы стать опытным разработчиком.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              placeholder="Поиск курсов..."
            />
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                setSelectedTags(prev =>
                  prev.includes(tag.name)
                    ? prev.filter(t => t !== tag.name)
                    : [...prev, tag.name]
                )
              }
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        {/* Фильтры */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* <Select
            value={statusFilter}
            onValueChange={(value: 'published') => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="published">Опубликованные</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
            </SelectContent>
          </Select> */}

          <Select
            value={sortOrder}
            onValueChange={(value: 'asc' | 'desc') => {
              setSortOrder(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Сначала новые</SelectItem>
              <SelectItem value="asc">Сначала старые</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={difficultyFilter}
            onValueChange={(value: Difficulty | 'all') => {
              setDifficultyFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая сложность</SelectItem>
              <SelectItem value={Difficulty.NEWBIE}>Новичок</SelectItem>
              <SelectItem value={Difficulty.BEGINNER}>Начинающий</SelectItem>
              <SelectItem value={Difficulty.INTERMEDIATE}>Средний</SelectItem>
              <SelectItem value={Difficulty.ADVANCED}>Продвинутый</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[270px] space-y-1.5 h-10 self-start">
            <div className="flex justify-between text-sm">
              <span>
                Длительность: {durationRange[0]}ч - {durationRange[1]}ч
              </span>
            </div>
            <Slider
              value={durationRange}
              onValueChange={value =>
                setDurationRange(value as [number, number])
              }
              min={0}
              max={100}
              step={5}
              minStepsBetweenThumbs={1}
            />
          </div>

          <Button className="cursor-pointer" onClick={handleResetFilters}>
            Сбросить
          </Button>
        </div>
        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-2">
            <h1 className="text-3xl font-bold">😕 Курсы не найдены</h1>
            <p className="text-muted-foreground text-lg">
              Попробуйте изменить фильтры или проверьте доступные категории.
            </p>
          </div>
        )}
        {loading && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
              const imagePath = course.previewImageUrl
                ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${course.previewImageUrl}`
                : '/placeholder-course.png'

              return (
                <Card
                  key={course.id}
                  className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 rounded-xl overflow-hidden"
                >
                  <div className="flex flex-col h-full">
                    {/* Обложка */}
                    <div className="p-5">
                      <img
                        src={imagePath}
                        alt={course.title}
                        className="rounded-lg h-48 w-full object-cover"
                      />
                    </div>

                    {/* Контент */}
                    <div className="flex flex-col flex-1 p-5">
                      {/* Заголовок и описание */}
                      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Бейджи */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          className={getDifficultyColor(course.difficulty)}
                        >
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline">{course.duration} часов</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags?.map(tag => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Дно карточки */}
                      <div className="mt-auto flex items-center justify-between pt-3 border-t text-sm">
                        <span className="text-muted-foreground">
                          ⏱ {course.duration} ч
                        </span>
                        <Button asChild size="sm" className="text-sm">
                          <Link href={`/courses/${course.id}`}>Открыть</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Показано {courses.length} из {total} курсов
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Назад
                </Button>
              </PaginationItem>

              <PaginationItem>
                <div className="px-4">
                  Страница {page} из {totalPages}
                </div>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Вперед
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
