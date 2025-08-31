'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { toast } from 'react-toastify'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { fileService } from '@/shared/api/file-upload.service'
import { InputImageUpload } from '@/shared/ui/input-image-upload'
import { InputUnityPackageUpload } from '@/shared/ui/input-unity-package-upload'
import { Skeleton } from '@/shared/ui/skeleton'
import { TagInput } from '@/shared/ui/tag-input'
import { CreateCriteriaDialog } from './create-criteria-dialog'
import { practiseService } from '@/entities/practise/api/practise.service'
import {
  PracticeFormValues,
  practiceFormSchema
} from '../model/validation-schema'
import dynamic from 'next/dynamic'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/shadcn/style.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
const BlockNoteEditor = dynamic(() => import('./block-note-editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />
})

interface EditPracticeFormProps {
  practiceId?: string
  title?: string
  submitButtonText?: string
  onSuccess?: () => void
}

export function EditPracticeForm({
  practiceId,
  title = 'Редактирование практики',
  submitButtonText = 'Сохранить изменения',
  onSuccess
}: EditPracticeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!!practiceId)
  const [initialImage, setInitialImage] = useState<string | undefined>()
  const [initialContent, setInitialContent] = useState<string>('')
  const [criteriaList, setCriteriaList] = useState<any[]>([])
  const form = useForm<PracticeFormValues>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      previewImageUrl: null,
      assetsFileUrl: null,
      difficulty: 'NEWBIE',
      duration: 1,
      isPublished: false,
      tags: [],
      criteria: []
    }
  })

  useEffect(() => {
    const fetchPractice = async () => {
      try {
        if (!practiceId) return

        const practice = await practiseService.getPractise(practiceId)
        console.log('practice', practice)
        form.reset({
          ...practice,
          previewImageUrl: practice.previewImageUrl || null,
          assetsFileUrl: practice.assetsFileUrl || null,
          content: practice.content || '',
          tags: practice.tags || [],
          criteria: practice.reviewCriteria || []
        })
        setInitialImage(practice.previewImageUrl)
        setInitialContent(practice.content || '')
        setCriteriaList(practice.reviewCriteria)
      } catch (error) {
        console.error('Ошибка загрузки практики:', error)
        toast.error('Не удалось загрузить практику')
      } finally {
        setLoading(false)
      }
    }

    if (practiceId) fetchPractice()
    else setLoading(false)
  }, [practiceId, form])

  const onSubmit = async (values: PracticeFormValues) => {
    try {
      let previewImageUrl = initialImage
      let assetsFileUrl = form.getValues('assetsFileUrl')

      if (values.previewImage?.[0]) {
        previewImageUrl = await fileService.uploadImage(values.previewImage[0])
      }

      if (values.assetsFile?.[0]) {
        console.log('values.assetsFile[0]', values.assetsFile[0])
        assetsFileUrl = await fileService.uploadUnityPackage(
          values.assetsFile[0]
        )
        console.log('assetsFileUrl', assetsFileUrl)
      }

      const practiceData = {
        ...values,
        previewImageUrl,
        assetsFileUrl,
        criteria: criteriaList
      }

      if (practiceId) {
        await practiseService.updatePractise(practiceId, practiceData)
        toast.success('Практика обновлена')
      }

      onSuccess ? onSuccess() : router.push('/admin/practises')
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      toast.error('Не удалось сохранить практику')
    }
  }

  const handleDeleteCriteria = async (criteriaId: string) => {
    try {
      if (practiceId) {
        await practiseService.deleteCriteria(practiceId, criteriaId)
        setCriteriaList(prev => prev.filter(c => c.id !== criteriaId))
        toast.success('Критерий удален')
      }
    } catch (error) {
      toast.error('Ошибка удаления критерия')
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 max-w-3xl mx-auto px-4"
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          <Button type="submit" className="h-10 px-6">
            {submitButtonText}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <InputImageUpload
            key={initialImage}
            fieldName={`previewImage`}
            previewImageUrl={initialImage}
          />

          <>
            <InputUnityPackageUpload
              fieldName="assetsFile"
              initialFileUrl={form.getValues('assetsFileUrl')}
            />
            <Button className="cursor-pointer" type="button">
              <a
                href={`${
                  process.env.NEXT_PUBLIC_API_URL
                }/files/${form.getValues('assetsFileUrl')}`}
              >
                Скачать
              </a>
            </Button>
          </>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Название практики"
                  className="text-2xl font-semibold px-0 py-2 border-0 border-b rounded-none focus:ring-0 focus:border-black"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Теги</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={tag => form.setValue('tags', [...field.value, tag])}
                  onDeleteTag={tag =>
                    form.setValue(
                      'tags',
                      field.value.filter(t => t.id !== tag.id)
                    )
                  }
                />
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
              <FormLabel className="text-lg">Краткое описание</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Опишите практическое задание"
                  rows={4}
                  className="text-gray-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сложность</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сложность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWBIE">Новичок</SelectItem>
                    <SelectItem value="BEGINNER">Начинающий</SelectItem>
                    <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                    <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Длительность (часы)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel>Опубликовать</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Критерии оценки</h3>
            <CreateCriteriaDialog
              practiceId={practiceId}
              onSuccess={newCriteria =>
                setCriteriaList(prev => [...prev, newCriteria])
              }
            >
              <Button size="sm" variant="outline">
                Добавить критерий
              </Button>
            </CreateCriteriaDialog>
          </div>

          {criteriaList &&
            criteriaList.map(criteria => (
              <div key={criteria.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{criteria.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {criteria.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CreateCriteriaDialog
                      practiceId={practiceId}
                      criteria={criteria}
                      onSuccess={updated =>
                        setCriteriaList(prev =>
                          prev.map(c => (c.id === updated.id ? updated : c))
                        )
                      }
                    >
                      <Button variant="ghost" size="sm" type="button">
                        Редактировать
                      </Button>
                    </CreateCriteriaDialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteCriteria(criteria.id)}
                      type="button"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Детальное описание</FormLabel>
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
