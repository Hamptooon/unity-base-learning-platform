'use client'
import { Skeleton } from '@/shared/ui/skeleton'

import { ArticleCard } from './article-card'
import { Article } from '../../model/types'
interface ArticleListProps {
  articles: Article[]
  loading: boolean
  error: string
}
export const ArticleList = ({ articles, loading, error }: ArticleListProps) => {
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  } else if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map(article => {
        return <ArticleCard key={article.id} article={article} />
      })}
    </div>
  )
}
