'use client'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { RiEdit2Line } from 'react-icons/ri'
import { MdDeleteOutline } from 'react-icons/md'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/ui/alert-dialog'
import { useState } from 'react'
import { Article } from '../../model/types'
import { FaEye } from 'react-icons/fa'
import { MdOutlinePublish } from 'react-icons/md'
import { MdOutlineHideSource } from 'react-icons/md'
interface ArticleCardProps {
  article: Article
  onDelete: (articleId: string) => void
  onPublish: (articleId: string) => void
  onHide: (articleId: string) => void
}

export const ArticleCard = ({
  article,
  onDelete,
  onPublish,
  onHide
}: ArticleCardProps) => {
  const imagePath = article.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${article.previewImageUrl}`
    : '/placeholder-course.png'
  const [isPublished, setIsPublished] = useState(article.isPublished)

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
              Просмотреть
            </Button>
          </a>
          {isPublished ? (
            <div className="w-full">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-10"
                onClick={() => {
                  onHide(article.id)
                  setIsPublished(false)
                }}
              >
                <MdOutlineHideSource />
                Скрыть
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <Button
                className="w-full flex items-center justify-center gap-2 h-10"
                onClick={() => {
                  onPublish(article.id)
                  setIsPublished(true)
                }}
              >
                <MdOutlinePublish />
                Опубликовать
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <a href={`/admin/articles/edit/${article.id}`}>
              <Button className="h-full">
                <RiEdit2Line />
              </Button>
            </a>
            <AlertDialog>
              <AlertDialogTrigger className="flex items-center justify-center border-2 p-3 rounded-md cursor-pointer  hover:bg-red-700 bg-red-900">
                <MdDeleteOutline />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Вы уверены, что хотите удалить этот курс?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя будет отменить. Данные курса будут
                    полностью удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(article.id)}>
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  )
}
