'use client'
import { SearchBar } from '@/shared/ui/search-bar'
import { useState, useMemo, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { CourseList } from '@/entities/course/ui/admin/course-list'
import { useCourses } from '@/entities/course/model/use-courses'
import CreateCourseModal from '@/features/admin/course/create/ui/create-course-modal'
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
import { Difficulty } from '@/entities/course/model/types'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { useTags } from '@/entities/tag/model/use-tags'
export default function Courses() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all')
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
      status: statusFilter !== 'all' ? statusFilter : undefined,
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
  useEffect(() => {
    console.log('requestParams', requestParams)
  }, [requestParams])
  const {
    courses,
    total,
    loading,
    error,
    deleteCourse,
    publishCourse,
    hideCourse
  } = useCourses(requestParams)

  // Оптимизированный обработчик поиска
  const handleSearch = useDebouncedCallback((value: string) => {
    setPage(1)
    setSearchValue(value)
  }, 500)

  const handleResetFilters = () => {
    setPage(1)
    setStatusFilter('all')
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            placeholder="Поиск курсов..."
          />
        </div>
        <CreateCourseModal />
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
        <Select
          value={statusFilter}
          onValueChange={(value: 'all' | 'published' | 'draft') => {
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
        </Select>
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
            onValueChange={value => setDurationRange(value as [number, number])}
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

      <CourseList
        courses={courses}
        loading={loading}
        error={error}
        onDeleteCourse={deleteCourse}
        onPublishCourse={publishCourse}
        onHideCourse={hideCourse}
      />

      {/* Пагинация */}
      {courses.length > 0 && (
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
      )}
    </div>
  )
}
