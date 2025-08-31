'use client'
import { useState, useMemo } from 'react'
import { SearchBar } from '@/shared/ui/search-bar'
import { Badge } from '@/shared/ui/badge'
import { PracticeList } from '@/entities/practise/ui/user/practise-list'
import { usePractises } from '@/entities/practise/model/use-practises'
import { useTags } from '@/entities/tag/model/use-tags'
import CreatePracticeModal from '@/features/admin/practise/create/ui/create-practise-modal'
import { useDebouncedCallback } from 'use-debounce'
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
import { Button } from '@/shared/ui/button'

export default function Practices() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const { tags: allTags } = useTags('course')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<'published'>('published')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const requestParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter == 'published' ? statusFilter : undefined,
      search: searchValue,
      tags: selectedTags.join(',') || undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      sortOrder
    }),
    [page, limit, searchValue, selectedTags, selectedDifficulty, sortOrder]
  )

  const { practises, total, loading, error } = usePractises(requestParams)

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    setPage(1)
    setSearchValue(value)
  }, 500)

  const handleResetFilters = () => {
    setPage(1)
    setSearchValue('')
    setSelectedTags([])
    setSelectedDifficulty('all')
    setSortOrder('desc')
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            placeholder="Поиск практик..."
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map(tag => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleTagToggle(tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Select
          value={selectedDifficulty}
          onValueChange={(value: string) => {
            setSelectedDifficulty(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Сложность" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            <SelectItem value="NEWBIE">Новичок</SelectItem>
            <SelectItem value="BEGINNER">Начинающий</SelectItem>
            <SelectItem value="INTERMEDIATE">Средний</SelectItem>
            <SelectItem value="ADVANCED">Продвинутый</SelectItem>
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

        <Button onClick={handleResetFilters}>Сбросить</Button>
      </div>

      <PracticeList practices={practises} loading={loading} error={error} />
      {practises.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-2">
          <h1 className="text-3xl font-bold">😕 Челленджей нет</h1>
          <p className="text-muted-foreground text-lg">
            Попробуйте изменить фильтры или проверьте доступные категории.
          </p>
        </div>
      )}
      {practises.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Показано {practises.length} из {total} практик
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
