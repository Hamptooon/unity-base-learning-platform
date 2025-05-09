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

import { Course } from '@/entities/course/model/types'
import { getDifficultyColor } from '@/shared/utils/functions'
interface CourseCardProps {
  course: Course
  onDelete: (courseId: string) => void
}
export const CourseCard = ({ course, onDelete }: CourseCardProps) => {
  const imagePath = course.previewImageUrl
    ? `${process.env.NEXT_PUBLIC_API_STATIC_URL}${course.previewImageUrl}`
    : '/placeholder-course.png'
  return (
    <Card
      key={course.id}
      className="hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-6 space-y-4">
        <img
          src={imagePath}
          alt={course.title}
          className="rounded-lg h-48 w-full object-cover mb-4"
        />
        <h3 className="text-xl font-semibold">{course.title}</h3>
        <p className="text-gray-600 line-clamp-3">{course.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
          <Badge variant="outline">{course.duration} часов</Badge>
        </div>

        <div className="flex justify-self-end gap-4">
          <div>
            <a href={`/admin/courses/edit/${course.id}`}>
              <Button className="cursor-pointer">
                <RiEdit2Line />
              </Button>
            </a>
          </div>
          <div>
            <AlertDialog>
              <AlertDialogTrigger className="flex items-center justify-center w-full h-full border-2 p-3 rounded-md cursor-pointer hover:bg-neutral-900">
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
                  <AlertDialogAction onClick={() => onDelete(course.id)}>
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
