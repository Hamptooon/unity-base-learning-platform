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
import { PlusCircle } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from 'react-toastify'
import { useState } from 'react'
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
import { courseService } from '../../../../../entities/course/api/course.service'
import {
  CoursePartType,
  CoursePart,
  CoursePartLocal
} from '@/entities/course/model/types'

const coursePartFormSchema = z.object({
  type: z.nativeEnum(CoursePartType, {
    required_error: 'Выберите тип части курса',
    message: 'Выберите тип части курса'
  }),
  title: z
    .string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(40, 'Название должно быть не длиннее 40 символов'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(200, 'Описание должно быть не длиннее 200 символов')
})

type CoursePartFormValues = z.infer<typeof coursePartFormSchema>

interface CreatePartDialogProps {
  currentCourseId: string
  currentSortOrder: number
  onCreate: (part: CoursePartLocal) => void
}

export default function CreatePartDialog({
  currentCourseId,
  currentSortOrder,
  onCreate
}: CreatePartDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<CoursePartFormValues>({
    resolver: zodResolver(coursePartFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: undefined,
      title: '',
      description: ''
    }
  })

  const handleSubmit = form.handleSubmit(async data => {
    try {
      const newPartData = {
        ...data,
        sortOrder: currentSortOrder
      }
      const newCoursePart = await courseService.createCoursePart(
        currentCourseId,
        newPartData
      )
      onCreate({ ...newCoursePart, isOpen: false })

      setIsDialogOpen(false)
      toast.success('Часть курса успешно создана')
    } catch (error) {
      console.error('Ошибка при создании части:', error)
      toast.error('Не удалось создать часть курса')
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="h-4 w-4" />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создание новой части курса</DialogTitle>
          <DialogDescription>
            Заполните все поля для создания новой части курса
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип части</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex justify-center gap-4"
                    >
                      <ToggleGroupItem
                        value={CoursePartType.THEORETICAL}
                        className="p-3 border-2 border-dashed data-[state=on]:border-primary"
                      >
                        Теория
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value={CoursePartType.PRACTICAL}
                        className="p-3 border-2 border-dashed data-[state=on]:border-primary"
                      >
                        Практика
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите название" />
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
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Введите описание"
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
                Создать
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
