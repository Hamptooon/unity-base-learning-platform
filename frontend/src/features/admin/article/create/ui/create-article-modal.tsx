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
import { articleService } from '@/entities/article/api/article.service'
import { toast } from 'react-toastify'

import {
  CreateArticleFormValues,
  articleCreateFormSchema
} from '../model/validation'

export default function CreateArticleModal() {
  const form = useForm<CreateArticleFormValues>({
    resolver: zodResolver(articleCreateFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: ''
    }
  })
  const router = useRouter()
  const onSubmit = async (data: CreateArticleFormValues) => {
    try {
      const newArticle = await articleService.createArticle(data)
      toast.success('Статья успешно создан')
      router.push(`/admin/articles/edit/${newArticle.id}`)
    } catch (error) {
      console.error('Ошибка при создании статьи:', error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Создать Статью
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создание статьи</DialogTitle>
          <DialogDescription>
            Напишите основную информацию о статье.
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
                    <Input {...field} placeholder="Название статьи" />
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
                      placeholder="Описание статьи"
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
