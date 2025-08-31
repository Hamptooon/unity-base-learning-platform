'use client'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

import { StandalonePractice } from '../../model/types'
import { getDifficultyColor } from '@/shared/utils/functions'
import { FaEye } from 'react-icons/fa'
interface PracticeCardProps {
  practice: StandalonePractice
}

export const PracticeCard = ({ practice }: PracticeCardProps) => {
  const imagePath = practice.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${practice.previewImageUrl}`
    : '/placeholder-practice.png'

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
              Решить
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
