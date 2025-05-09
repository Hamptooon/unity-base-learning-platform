'use client'
import { useState, useRef, useEffect, memo, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/shared/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import { Card, CardContent } from '@/shared/ui/card'
import { PlusCircle, Trash2, UploadCloud } from 'lucide-react'
import { Slider } from '@/shared/ui/slider'
import { Difficulty, Course, CoursePart } from '@/entities/course/model/types'
import { courseService } from '../../../../../entities/course/api/course.service'
import { fileService } from '@/shared/api/file-upload.service'
import { IoMdInformationCircle } from 'react-icons/io'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { BiSolidStopwatch } from 'react-icons/bi'
import { FaCheck } from 'react-icons/fa'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useRouter, usePathname } from 'next/navigation'
import CreatePartDialog from '@/features/admin/course/edit-course/ui/create-part-dialog'
import { CourseFormValues, courseFormSchema } from '../model/validation-schema'
import { CoursePartType } from '@/entities/course/model/types'
import { SortableItem } from '@/features/admin/course/edit-course/ui/sortable-course-part'
import { InputImageUpload } from '@/shared/ui/input-image-upload'
import { Skeleton } from '@/shared/ui/skeleton'

export const EditCourseForm: React.FC = memo(() => {
  const [partsOpenedStatus, setPartsOpenedStatus] = useState<
    Record<string, boolean>
  >({})
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const currentParts = [...(form.getValues('parts') || [])]
    const oldIndex = currentParts.findIndex(p => p.id === active.id)
    const newIndex = currentParts.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newParts = arrayMove(currentParts, oldIndex, newIndex)
    const updatedParts = newParts.map((part, index) => ({
      ...part,
      sortOrder: index + 1
    }))
    form.setValue('parts', updatedParts)
  }

  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectiveInputRef = useRef<HTMLInputElement>(null)

  // Навигационные состояни
  const pathname = usePathname()
  const { 'course-id': courseId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      prerequisites: '',
      duration: 1,
      difficulty: Difficulty.NEWBIE,
      learningObjectives: [],
      parts: []
    }
  })

  const {
    formState: { isDirty }
  } = form

  useEffect(() => {
    // Этот обработчик будет вызван при перезагрузке страницы или закрытии вкладки
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        const message =
          'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    // Перехват клика по ссылкам для предотвращения навигации
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && isDirty) {
        const href = anchor.getAttribute('href')
        if (href && href !== pathname) {
          // Предотвращаем переход по ссылке
          e.preventDefault()
          // Спрашиваем пользователя через стандартный confirm браузера
          const confirmed = window.confirm(
            'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?'
          )
          // Если пользователь подтвердил, переходим по ссылке
          if (confirmed) {
            window.location.href = href
          }
        }
      }
    }

    // Добавляем слушатели событий
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleClick, true) // true чтобы перехватывать события на стадии погружения

    // Очищаем слушатели при размонтировании компонента
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleClick, true)
    }
  }, [isDirty, pathname])
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await courseService.getCourseInfo(courseId as string)
        const initialOpenStatus =
          course.parts?.reduce((acc, part) => {
            if (part.id) {
              acc[part.id] = false
            }
            return acc
          }, {} as Record<string, boolean>) || {}
        setPartsOpenedStatus(initialOpenStatus)
        const formattedData: CourseFormValues = {
          ...course,
          previewImage: undefined,
          learningObjectives: course.learningObjectives
            ? course.learningObjectives.map(obj => obj.description)
            : [],
          parts:
            course.parts?.map(part => {
              const basePart = {
                id: part.id,
                sortOrder: part.sortOrder,
                title: part.title || '',
                description: part.description || '',
                previewImageUrl: part.previewImageUrl || undefined
              }

              if (part.type === CoursePartType.PRACTICAL) {
                return {
                  ...basePart,
                  type: CoursePartType.PRACTICAL as const,
                  practice: {
                    content: part.practice?.content || '',
                    id: part.coursePracticeTaskId || undefined,
                    assetsFileUrl: part.practice?.assetsFileUrl || undefined
                  },
                  coursePracticeTaskId: part.coursePracticeTaskId || undefined
                }
              }

              return {
                ...basePart,
                type: CoursePartType.THEORETICAL as const,
                article: {
                  content: part.article?.content || '',
                  id: part.courseArticleId || undefined
                },
                courseArticleId: part.courseArticleId || undefined
              }
            }) ?? []
        }
        setPreviewUrl(course.previewImageUrl)
        form.reset(formattedData)
      } catch (error) {
        console.error('Ошибка при загрузке курса:', error)
        toast.error(
          `Ошибка при загрузке курса: ${error || 'Неизвестная ошибка'}`
        )
      } finally {
        setLoading(false)
      }
    }

    if (courseId) fetchCourse()
  }, [courseId])
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addObjective = () => {
    const value = objectiveInputRef.current?.value.trim()
    if (value && value.length >= 5) {
      form.setValue('learningObjectives', [
        ...(form.getValues().learningObjectives ?? []),
        value
      ])
      if (objectiveInputRef.current) {
        objectiveInputRef.current.value = ''
      }
    }
  }

  const onSubmit = async (data: CourseFormValues) => {
    try {
      const previewImageUrl = data.previewImage
        ? await fileService.uploadImage(data.previewImage[0])
        : undefined
      const previewImageUrlsParts: Record<string, string> = {}
      const assetsFileUrlsParts: Record<string, string> = {}
      if (data.parts) {
        for (const part of data.parts) {
          const previewImagePartUrl = part.previewImage
            ? await fileService.uploadImage(part.previewImage[0])
            : undefined
          if (previewImagePartUrl) {
            previewImageUrlsParts[part.id] = previewImagePartUrl
          }
          if (part.type === CoursePartType.PRACTICAL) {
            console.log('part.practice', part.practice)
            const assetsFileUrl = part.practice.assetsFile
              ? await fileService.uploadUnityPackage(
                  part.practice.assetsFile[0]
                )
              : undefined
            assetsFileUrlsParts[part.id] = assetsFileUrl
          }
        }
      }
      const formattedData: Course = {
        title: data.title,
        description: data.description,
        previewImageUrl: previewImageUrl,
        prerequisites: data.prerequisites,
        duration: Number(data.duration),
        difficulty: data.difficulty,
        learningObjectives: (data.learningObjectives ?? []).map(obj => ({
          description: obj
        })),
        parts:
          data.parts?.map((part, index) => ({
            ...part,
            sortOrder: index + 1,
            previewImageUrl: previewImageUrlsParts[part.id],
            practice:
              part.type === CoursePartType.PRACTICAL
                ? {
                    ...part.practice,
                    assetsFileUrl: assetsFileUrlsParts[part.id]
                  }
                : undefined
          })) ?? []
      }

      const newCourse = await courseService.updateCourseInfo(
        courseId as string,
        formattedData
      )
      toast.success('Данные сохранены')

      ////////
      form.reset(data) // Важно: сбрасываем состояние формы
      setNavigationConfirmed(false)
      setTargetUrl(null)
    } catch (error: any) {
      console.error('Ошибка при создании курса:', error)
      toast.error(
        `Ошибка при сохранении данных: ${
          error.response?.data?.message || 'Неизвестная ошибка'
        }`
      )
    }
  }
  const togglePart = (id: string) => {
    setPartsOpenedStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }
  const addCoursePart = async (newPart: CoursePart) => {
    console.log('newPart', newPart)
    form.setValue('parts', [
      ...(form.getValues('parts') ?? []),
      newPart.type === CoursePartType.THEORETICAL
        ? {
            ...newPart,
            type: CoursePartType.THEORETICAL as const,
            article: {
              content: newPart.article?.content || ''
            }
          }
        : {
            ...newPart,
            type: CoursePartType.PRACTICAL as const,
            practice: {
              content: newPart.practice?.content || ''
            }
          }
    ])
  }
  const handleDeletePart = async (partId: string) => {
    try {
      await courseService.deleteCoursePart(courseId as string, partId)
      const currentParts = form.getValues('parts') || []
      form.setValue(
        'parts',
        currentParts.filter(p => p.id !== partId)
      )

      toast.success('Часть курса удалена')
    } catch (error) {
      console.error('Ошибка при удалении:', error)
      toast.error('Не удалось удалить часть курса')
    }
  }
  const sortedParts = useMemo(() => {
    const parts = form.watch('parts') || []
    return [...parts].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [form.watch('parts')]) // Зависимость от значений parts

  return (
    <div className="w-full p-5 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="fixed bottom-4 right-10 z-50 bg-background/90 backdrop-blur-sm p-2 rounded-lg">
            {loading ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <Button
                type="submit"
                className="h-12 text-lg px-8 shadow-lg transition-all hover:scale-105"
              >
                Сохранить
              </Button>
            )}
          </div>

          <div className="flex gap-4 border-b-2 pb-4">
            <div className="flex flex-col gap-4 w-4/5">
              <div className="flex items-center gap-4">
                {loading ? (
                  <Skeleton className="h-6 w-20 rounded-full" />
                ) : (
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <Badge className="capitalize">{field.value}</Badge>
                    )}
                  />
                )}

                <div className="flex items-center gap-1">
                  {loading ? (
                    <Skeleton className="h-5 w-5 rounded-full" />
                  ) : (
                    <BiSolidStopwatch />
                  )}
                  {loading ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => <span>{field.value} ч</span>}
                    />
                  )}
                </div>
              </div>

              {loading ? (
                <>
                  <Skeleton className="h-9 w-full rounded-none" />
                  <Skeleton className="h-36 w-full rounded-lg" />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            className="font-bold md:text-3xl border-none p-0 focus-visible:ring-0"
                            placeholder="Название курса"
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
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            className="text-gray-300  p-2 focus-visible:ring-0 resize-none w-full"
                            rows={6}
                            placeholder="Описание курса"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {loading ? (
              <Skeleton className="w-2/5 h-60 rounded-lg" />
            ) : (
              <div className="w-3/5">
                <InputImageUpload
                  fieldName={`previewImage`}
                  previewImageUrl={previewUrl}
                />
              </div>
            )}
          </div>

          <div className="flex gap-10">
            <Card className="w-1/2 self-start">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                  {loading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <IoMdInformationCircle />
                      Необходимые знания
                    </>
                  )}
                </div>
                {loading ? (
                  <Skeleton className="h-32 w-full rounded-lg" />
                ) : (
                  <FormField
                    control={form.control}
                    name="prerequisites"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            className="text-gray-300 border-none p-0 focus-visible:ring-0 resize-none"
                            rows={5}
                            placeholder="Опишите необходимые знания"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="w-1/2 self-start">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                  {loading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <HiOutlineLightningBolt />
                      Чему вы научитесь?
                    </>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        ref={objectiveInputRef}
                        placeholder="Добавьте цель обучения"
                        className="flex-1"
                        onKeyDown={e => e.key === 'Enter' && addObjective()}
                      />
                      <Button
                        type="button"
                        onClick={addObjective}
                        variant="outline"
                        className="gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Добавить
                      </Button>
                    </div>

                    <ul className="space-y-3">
                      {form.watch('learningObjectives')?.map((obj, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 pb-1"
                        >
                          <FaCheck className="text-green-500" />
                          <span className="flex-1">{obj}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newObjectives = (
                                form.getValues('learningObjectives') ?? []
                              ).filter((_, i) => i !== index)

                              form.setValue('learningObjectives', newObjectives)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 px-5">
            {loading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Продолжительность курса (часы)</FormLabel>
                      <div className="flex gap-4 items-center">
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={value => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <span className="w-16 text-center text-lg font-medium">
                          {field.value} ч
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Уровень сложности</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Difficulty).map(level => (
                            <SelectItem
                              key={level}
                              value={level}
                              className="capitalize"
                            >
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <div className="space-y-6">
            {loading ? (
              <Skeleton className="h-8 w-48 mb-4" />
            ) : (
              <h2 className="text-2xl font-bold border-b pb-2">Части курса</h2>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                {form.watch('parts') && (
                  <SortableContext
                    items={sortedParts}
                    strategy={verticalListSortingStrategy}
                  >
                    {(form.watch('parts') || []).map((part, index) => (
                      <SortableItem
                        key={`${part.id}-${index}`}
                        courseId={courseId as string}
                        fieldIndex={index}
                        part={part}
                        isOpen={partsOpenedStatus[part.id]}
                        index={index + 1}
                        onToggle={() => togglePart(part.id ?? '')}
                        onDelete={handleDeletePart}
                      />
                    ))}
                  </SortableContext>
                )}
              </DndContext>
            )}
          </div>

          {!loading && (
            <CreatePartDialog
              currentCourseId={courseId as string}
              currentSortOrder={
                form.watch('parts') ? form.watch('parts')?.length + 1 : 1
              }
              onCreate={addCoursePart}
            />
          )}
        </form>
      </Form>
    </div>
  )
})
