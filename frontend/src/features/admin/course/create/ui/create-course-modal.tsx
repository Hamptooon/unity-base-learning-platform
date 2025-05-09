'use client'
import { Button } from '@/shared/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/shared/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { courseService } from '../../../../../entities/course/api/course.service'
import { toast } from 'react-toastify'

import {
  CreateCourseFormValues,
  courseCreateFormSchema
} from '../model/validation'

export default function CreateCourseModal() {
  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(courseCreateFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: ''
    }
  })
  const router = useRouter()
  const onSubmit = async (data: CreateCourseFormValues) => {
    try {
      const newCourse = await courseService.createCourseMainInfo(data)
      toast.success('Курс успешно создан')
      router.push(`/admin/courses/edit/${newCourse.id}`)
    } catch (error) {
      console.error('Ошибка при создании курса:', error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Создать курс
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создание курса</DialogTitle>
          <DialogDescription>
            Напишите основную информацию о курсе.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Название курса" />
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
                      rows={6}
                      placeholder="Описание курса"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Далее</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
