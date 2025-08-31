'use client'
import React, { useEffect, useState } from 'react'
import { articleService } from '@/entities/article/api/article.service'
import { Article } from '@/entities/article/model/types'
import { useParams } from 'next/navigation'
import { Badge } from '@/shared/ui/badge'
import { BlockNoteRenderer } from '@/shared/ui/block-note-renderer'
// import '@blocknote/core/style.css'
// import '@blocknote/react/style.css'
export default function ArticlePage() {
  const { 'article-id': id } = useParams()

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    setLoading(true)
    articleService
      .getArticle(id)
      .then(setArticle)
      .catch(err => setError(err.message || 'Ошибка при загрузке статьи'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-center py-10">Загрузка...</p>
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>
  if (!article) return null
  const imagePath = article.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${article.previewImageUrl}`
    : '/placeholder-course.png'
  return (
    <article className="max-w-7xl  mx-auto px-4 py-8 space-y-6">
      <img
        src={imagePath}
        alt={`Превью: ${article.title}`}
        className="w-full rounded-lg object-cover max-h-96"
      />
      <div className="flex flex-wrap gap-2">
        {article.tags?.map(tag => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </div>
      <h1 className="text-4xl font-extrabold">{article.title}</h1>

      <p className="text-lg text-gray-700">{article.description}</p>

      <BlockNoteRenderer content={article.content} />

      <p className="text-sm text-gray-400">
        Опубликовано: {new Date(article.createdAt).toLocaleDateString()}
      </p>
    </article>
  )
}
