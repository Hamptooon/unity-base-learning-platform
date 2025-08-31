'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { FaExclamationTriangle } from 'react-icons/fa'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { set, z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/shared/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  ComplaintReview,
  ComplaintReviewType
} from '@/entities/reviews/model/types'
import { reviewService } from '@/features/admin/course/api/review.service'
import { Badge } from '@/shared/ui/badge'
const coursePartFormSchema = z.object({
  type: z.nativeEnum(ComplaintReviewType, {
    required_error: 'Выберите тип жалобы',
    message: 'Выберите тип жалобы'
  }),
  comment: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(200, 'Описание должно быть не длиннее 200 символов')
})

type CoursePartFormValues = z.infer<typeof coursePartFormSchema>

interface ComplaintReviewDialogProps {
  reviewId: string
  reviewedUserId: string
  reviewerUserId: string
  //   onComplaintReview: (reviewId: string) => void
}

export default function ComplaintReviewDialog({
  reviewId,
  reviewedUserId,
  reviewerUserId
}: //   onComplaintReview
ComplaintReviewDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [complaintReview, setComplaintReview] =
    useState<ComplaintReview | null>(null)
  const form = useForm<CoursePartFormValues>({
    resolver: zodResolver(coursePartFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: undefined,
      comment: ''
    }
  })
  useEffect(() => {
    const fetchComplaintReview = async () => {
      try {
        console.log(reviewId, reviewedUserId)
        const complaintReviewData = await reviewService.getComplaintReview(
          reviewId,
          reviewedUserId
        )
        console.log('Complaint Review:', complaintReviewData)
        setComplaintReview(complaintReviewData)
      } catch (error) {
        console.error('Error fetching complaint review:', error)
      }
    }
    fetchComplaintReview()
  }, [])
  const handleSubmit = form.handleSubmit(async data => {
    try {
      //   const newPartData = {
      //     ...data,
      //     sortOrder: currentSortOrder
      //   }
      //   const newCoursePart = await courseService.createCoursePart(
      //     currentCourseId,
      //     newPartData
      //   )
      //   onCreate({ ...newCoursePart, isOpen: false })
      //   const result = await reviewService.complaintToReview(reviewId)
      const complaintReviewData = await reviewService.complaintReview(
        reviewId,
        {
          reviewerUserId: reviewerUserId,
          complaintReviewType: data.type,
          comment: data.comment
        }
      )
      setComplaintReview(complaintReviewData)
      console.log('Жалоба успешно отправлена', complaintReview)
      setIsDialogOpen(false)
      //   onComplaintReview(reviewId)
      toast.success('Жалоба успешно отправлена и будет рассмотрена')
    } catch (error) {
      console.error('Ошибка при отправке', error)
      toast.error('Не удалось отправить жалобу')
    }
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setIsDialogOpen(false)
    } else {
      setIsDialogOpen(true)
    }
  }
  if (complaintReview) {
    return (
      <div>
        <Badge variant="destructive">
          Жалоба была успешно отправлена и будет рассмотрена
        </Badge>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Тип жалобы:{' '}
            {complaintReview.complaintReviewType === ComplaintReviewType.ABUSE
              ? 'Оскорбление'
              : 'Некорректная оценка'}
          </p>
          <p className="text-sm text-muted-foreground">
            Описание: {complaintReview.comment}
          </p>
        </div>
      </div>
    )
  }
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="cursor-pointer">
          <FaExclamationTriangle className="h-4 w-4" />
          Пожаловаться / Оспорить
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Жалоба или оспаривание ревью </DialogTitle>
          <DialogDescription>
            Заполните все поля, выберите тип жалобы, опишите подробно причину и
            нажмите "Отправить"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип жалобы</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-2 w-full" // Изменено на grid layout
                    >
                      <ToggleGroupItem
                        value={ComplaintReviewType.ABUSE}
                        className="p-2 h-auto whitespace-normal border-2 border-dashed data-[state=on]:border-primary text-center"
                      >
                        Оскорбление
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value={ComplaintReviewType.INCORRECTRATE}
                        className="p-2 h-auto whitespace-normal border-2 border-dashed data-[state=on]:border-primary text-center"
                      >
                        Некорректная оценка
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Введите описание и причину жалобы"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="button" onClick={handleSubmit}>
                Отправить
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
