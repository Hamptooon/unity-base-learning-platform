'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from 'react-toastify'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import { articleService } from '@/entities/article/api/article.service'
import { fileService } from '@/shared/api/file-upload.service'
import { InputImageUpload } from '@/shared/ui/input-image-upload'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  articleFormSchema,
  ArticleFormValues
} from '@/features/admin/article/edit/model/validation-schema'
import dynamic from 'next/dynamic'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/shadcn/style.css'
import { TagInput } from '@/shared/ui/tag-input'
import { Tag } from '@/entities/tag/model/types'
const BlockNoteEditor = dynamic(() => import('./block-note-editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />
})

interface EditArticleFormProps {
  articleId?: string
  title?: string
  submitButtonText?: string
  onSuccess?: () => void
}

export function EditArticleForm({
  articleId,
  title = 'Редактирование статьи',
  submitButtonText = 'Сохранить изменения',
  onSuccess
}: EditArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!!articleId)
  const [initialImage, setInitialImage] = useState<string | undefined>()
  const [initialContent, setInitialContent] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      previewImageUrl: null,
      isPublished: false,
      tags: []
    }
  })

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (!articleId) return

        const article = await articleService.getArticle(articleId)
        form.reset({
          ...article,
          previewImageUrl: article.previewImageUrl || null,
          content: article.content || '',
          tags: article.tags || []
        })
        setInitialImage(article.previewImageUrl)
        setInitialContent(article.content || '')
      } catch (error) {
        console.error('Ошибка при загрузке статьи:', error)
        toast.error('Не удалось загрузить статью')
      } finally {
        setLoading(false)
      }
    }

    if (articleId) fetchArticle()
    else setLoading(false)
  }, [articleId, form])

  // useEffect(() => {
  //   console.log(form.getValues())
  // }, [form.getValues('title')])
  const onSubmit = async (values: ArticleFormValues) => {
    console.log('Submitted values:', values)
    try {
      let previewImageUrl = initialImage

      if (values.previewImage?.[0]) {
        previewImageUrl = await fileService.uploadImage(values.previewImage[0])
      }

      const articleData = {
        ...values,
        previewImageUrl
      }

      if (articleId) {
        await articleService.updateArticle(articleId, articleData)
        toast.success('Статья успешно обновлена')
      } else {
        await articleService.createArticle(articleData)
        toast.success('Статья успешно создана')
      }

      onSuccess ? onSuccess() : router.push('/admin/articles')
    } catch (error) {
      console.error('Ошибка при сохранении статьи:', error)
      toast.error(`Не удалось ${articleId ? 'обновить' : 'создать'} статью`)
    }
  }

  if (loading) {
    return (
      <div className="w-full p-5 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  const addTagToForm = (tag: Tag) => {
    form.setValue('tags', [...form.getValues('tags'), tag])
    console.log('tags', form.getValues('tags'))
  }
  const deleteTagFromForm = (tag: Tag) => {
    const updatedTags = form.getValues('tags').filter(t => t.id !== tag.id)
    form.setValue('tags', updatedTags)
    console.log('tags', form.getValues('tags'))
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 max-w-3xl mx-auto px-4"
      >
        {/* Верхний заголовок и кнопка */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          <Button type="submit" className="h-10 px-6">
            {submitButtonText}
          </Button>
        </div>

        {/* Превью изображение */}
        <FormField
          control={form.control}
          name="previewImageUrl"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Превью</FormLabel>
              <FormControl>
                <InputImageUpload
                  fieldName="previewImage"
                  previewImageUrl={initialImage}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Заголовок */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Введите заголовок"
                  className="text-2xl font-semibold px-0 py-2 border-0 border-b rounded-none focus:ring-0 focus:border-black"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Теги */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Теги</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={(tag: Tag) => addTagToForm(tag)}
                  onDeleteTag={(tag: Tag) => deleteTagFromForm(tag)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Краткое описание */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">
                Краткое описание
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Введите краткое описание"
                  rows={4}
                  className="text-gray-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4 pt-4">
              <FormLabel className="text-md">Опубликовать сразу</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* Контент (редактор) */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Содержание</FormLabel>
              <FormControl>
                <BlockNoteEditor
                  initialContent={initialContent}
                  onChange={html => form.setValue('content', html)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
