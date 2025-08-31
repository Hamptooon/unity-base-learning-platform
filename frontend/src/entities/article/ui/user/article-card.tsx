'use client'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

import { Article } from '../../model/types'
import { FaEye } from 'react-icons/fa'

interface ArticleCardProps {
  article: Article
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const imagePath = article.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${article.previewImageUrl}`
    : '/placeholder-course.png'

  return (
    <Card
      key={article.id}
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-6 flex flex-col h-full">
        {/* Верхняя часть */}
        <div className="flex-grow space-y-4">
          <img
            src={imagePath}
            alt={article.title}
            className="rounded-lg h-48 w-full object-cover"
          />
          <h3 className="text-xl font-semibold line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 line-clamp-3">{article.description}</p>
          <div className="flex flex-wrap gap-2">
            {article.tags?.map(tag => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Нижняя часть — всегда внизу */}
        <div className="pt-6 mt-6 border-t flex justify-between items-center gap-2">
          <a href={`/articles/${article.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-10"
            >
              <FaEye />
              Читать
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
