'use client'

import { SearchBar } from '@/shared/ui/search-bar'
import { Badge } from '@/shared/ui/badge'
import { useState, useMemo } from 'react'
import { ArticleList } from '@/entities/article/ui/user/article-list' // отдельный компонент для пользователя
import { useArticles } from '@/entities/article/model/use-articles'
import { useTags } from '@/entities/tag/model/use-tags'
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
  PaginationItem
} from '@/shared/ui/pagination'
import { Button } from '@/shared/ui/button'

export default function ArticlesUser() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { tags: allTags } = useTags('article')
  const [statusFilter, setStatusFilter] = useState<'published'>('published')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Пользователи видят только опубликованные статьи, статус фильтр не нужен
  const requestParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter == 'published' ? statusFilter : undefined,
      search: searchValue,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      sortOrder
    }),
    [page, limit, searchValue, selectedTags, sortOrder]
  )

  const { articles, total, loading, error } = useArticles(requestParams)

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    setPage(1)
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    setPage(1)
    setSearchValue(value)
  }, 500)

  const handleResetFilters = () => {
    setPage(1)
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
      <div className="mb-8">
        <SearchBar
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          placeholder="Поиск статей..."
        />
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

      <div className="mb-6 flex flex-wrap gap-4 items-center">
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

        <Button onClick={handleResetFilters} className="cursor-pointer">
          Сбросить
        </Button>
      </div>

      <ArticleList articles={articles} loading={loading} error={error} />
      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-2">
          <h1 className="text-3xl font-bold">😕 Статьи не найдены</h1>
          <p className="text-muted-foreground text-lg">
            Попробуйте изменить фильтры или проверьте доступные категории.
          </p>
        </div>
      )}
      {articles.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Показано {articles.length} из {total} статей
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
