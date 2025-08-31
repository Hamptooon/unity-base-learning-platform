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
import { StandalonePractice } from '../../model/types'
import { getDifficultyColor } from '@/shared/utils/functions'
import { FaEye } from 'react-icons/fa'
import { useState } from 'react'
import { MdOutlinePublish } from 'react-icons/md'
import { MdOutlineHideSource } from 'react-icons/md'
interface PracticeCardProps {
  practice: StandalonePractice
  onDelete: (practiceId: string) => void
  onPublish: (practiceId: string) => void
  onHide: (practiceId: string) => void
}

export const PracticeCard = ({
  practice,
  onDelete,
  onPublish,
  onHide
}: PracticeCardProps) => {
  const imagePath = practice.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${practice.previewImageUrl}`
    : '/placeholder-practice.png'
  const [isPublished, setIsPublished] = useState(practice.isPublished)

  return (
    <Card
      key={practice.id}
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-6 flex flex-col h-full">
        {/* Верхняя часть карточки, занимает всё свободное пространство */}
        <div className="flex-grow space-y-4">
          <img
            src={imagePath}
            alt={practice.title}
            className="rounded-lg h-48 w-full object-cover"
          />
          <h3 className="text-xl font-semibold">{practice.title}</h3>
          <p className="text-gray-600 line-clamp-3">{practice.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(practice.difficulty)}>
              {practice.difficulty}
            </Badge>
            <Badge variant="outline">{practice.duration} часов</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {practice.tags?.map(tag => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Нижняя часть — всегда внизу */}
        <div className="pt-6 mt-6 border-t flex justify-between items-center gap-2">
          <a href={`/practises/${practice.id}`} className="w-full">
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
                  onHide(practice.id)
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
                  onPublish(practice.id)
                  setIsPublished(true)
                }}
              >
                <MdOutlinePublish />
                Опубликовать
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <a href={`/admin/practises/edit/${practice.id}`}>
              <Button className="h-full">
                <RiEdit2Line />
              </Button>
            </a>
            <AlertDialog>
              <AlertDialogTrigger className="flex items-center justify-center border-2 p-3 rounded-md cursor-pointer hover:bg-red-700 bg-red-900">
                <MdDeleteOutline />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Вы уверены, что хотите удалить этот курс?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя будет отменить. Данные задания будут
                    полностью удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(practice.id)}>
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
