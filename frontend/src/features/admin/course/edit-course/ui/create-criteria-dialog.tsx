// components/create-criteria-dialog.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { PlusCircle } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/shared/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CoursePractice, ReviewCriteria } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
const criteriaFormSchema = z.object({
  title: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
})

type CriteriaFormValues = z.infer<typeof criteriaFormSchema>

interface CreateCriteriaDialogProps {
  courseId: string
  partId: string
  practiseId: string
  criteria?: ReviewCriteria
  onSuccess: () => void
  children?: React.ReactNode
}

export function CreateCriteriaDialog({
  courseId,
  partId,
  practiseId,
  criteria,
  onSuccess,
  children
}: CreateCriteriaDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaFormSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  })

  useEffect(() => {
    if (criteria) {
      form.reset(criteria)
    } else {
      form.reset()
    }
  }, [criteria, form])

  const handleSubmit = form.handleSubmit(async values => {
    try {
      setLoading(true)

      if (criteria) {
        await courseService.updateReviewCriteria(
          courseId,
          partId,
          practiseId,
          criteria.id,
          values as ReviewCriteria
        )
      } else {
        await courseService.createReviewCriteria(
          courseId,
          partId,
          practiseId,
          values as ReviewCriteria
        )
      }

      onSuccess()
      setIsOpen(false)
      toast.success(criteria ? 'Критерий обновлен' : 'Критерий добавлен')
    } catch (error) {
      toast.error('Ошибка сохранения критерия')
    } finally {
      setLoading(false)
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2" type="button">
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить критерий
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {criteria
              ? 'Редактирование критерия'
              : 'Добавление критерия оценки'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название критерия</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите название критерия" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание критерия</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Опишите требования к выполнению"
                      className="min-h-[120px]"
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
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </Button>
              <Button type="button" disabled={loading} onClick={handleSubmit}>
                {loading
                  ? 'Сохранение...'
                  : criteria
                  ? 'Сохранить'
                  : 'Добавить'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
