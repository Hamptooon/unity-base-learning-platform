'use client'
import { SearchBar } from '@/shared/ui/search-bar'
import { Badge } from '@/shared/ui/badge'
import { useState, useMemo } from 'react'
import { ArticleList } from '@/entities/article/ui/admin/article-list'
import { useArticles } from '@/entities/article/model/use-articles'
import { useTags } from '@/entities/tag/model/use-tags'
import CreateArticleModal from '@/features/admin/article/create/ui/create-article-modal'
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

export default function Articles() {
  const [searchValue, setSearchValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { tags: allTags } = useTags('article')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const requestParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchValue,
      tags: selectedTags.join(',') || undefined, // <--- добавили
      sortOrder: sortOrder
    }),
    [page, limit, statusFilter, searchValue, selectedTags, sortOrder]
  )
  const {
    articles,
    total,
    loading,
    error,
    deleteArticle,
    publishArticle,
    hideArticle
  } = useArticles(requestParams)
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
    setStatusFilter('all')
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
            placeholder="Поиск статей..."
          />
        </div>
        <CreateArticleModal />
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

        <Button className="cursor-pointer" onClick={handleResetFilters}>
          Сбросить
        </Button>
      </div>
      <ArticleList
        articles={articles}
        loading={loading}
        error={error}
        onDeleteArticle={deleteArticle}
        onPublishArticle={publishArticle}
        onHideArticle={hideArticle}
      />
      {/* Пагинация */}
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
