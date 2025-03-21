// // app/courses/create/page.tsx
// // Не показывается сообщение что длина цели обучения меньше 5
// 'use client'

// import { useState, useRef } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/shared/ui/button'
// import { Input } from '@/shared/ui/input'
// import { Label } from '@/shared/ui/label'
// import { Textarea } from '@/shared/ui/textarea'
// import { toast } from 'react-toastify'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/shared/ui/form'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/shared/ui/select'
// import { PlusCircle, Trash2, UploadCloud } from 'lucide-react'
// import { Slider } from '@/shared/ui/slider'
// import { Difficulty, ICourse } from '@/entities/course/model/types'
// import { courseService } from '../../api/course.service'
// import { fileService } from '@/shared/api/file-upload.service'
// const courseFormSchema = z.object({
//   title: z.string().min(2, 'Название должно содержать минимум 2 символа'),
//   description: z
//     .string()
//     .min(10, 'Описание должно содержать минимум 10 символов'),
//   previewImage: z
//     .instanceof(FileList)
//     .refine(files => files.length > 0, 'Требуется изображение для превью')
//     .refine(
//       files => files[0]?.type.startsWith('image/'),
//       'Файл должен быть изображением'
//     ),
//   prerequisites: z
//     .string()
//     .min(5, 'Необходимые знания должны содержать минимум 5 символов'),
//   duration: z.coerce.number().min(1, 'Минимальная продолжительность - 1 час'),
//   difficulty: z.nativeEnum(Difficulty),
//   objectives: z
//     .array(
//       z.string().min(5, 'Цель обучения должна содержать минимум 5 символов')
//     )
//     .nonempty('Добавьте хотя бы одну цель обучения')
// })

// type CourseFormValues = z.infer<typeof courseFormSchema>

// export default function CreateCourseForm() {
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const objectiveInputRef = useRef<HTMLInputElement>(null)

//   const form = useForm<CourseFormValues>({
//     resolver: zodResolver(courseFormSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       prerequisites: '',
//       duration: 1,
//       difficulty: Difficulty.NEWBIE,
//       objectives: []
//     }
//   })

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onloadend = () => setPreviewUrl(reader.result as string)
//       reader.readAsDataURL(file)
//     }
//   }

//   const addObjective = () => {
//     const value = objectiveInputRef.current?.value.trim()
//     if (value && value.length >= 5) {
//       form.setValue('objectives', [...form.getValues().objectives, value])
//       if (objectiveInputRef.current) {
//         objectiveInputRef.current.value = ''
//       }
//     }
//   }

//   const onSubmit = async (data: CourseFormValues) => {
//     try {
//       const previewImageUrl = await fileService.uploadImage(
//         data.previewImage[0]
//       )
//       console.log('previewImageUrl', previewImageUrl)
//       const formattedData: ICourse = {
//         title: data.title,
//         description: data.description,
//         previewImageUrl, // Теперь это строка
//         prerequisites: data.prerequisites,
//         duration: Number(data.duration), // Явное преобразование в число
//         difficulty: data.difficulty,
//         objectives: data.objectives.map(obj => ({ description: obj })) // Преобразование формата
//       }

//       console.log('formattedData', formattedData)
//       const newCourse = await courseService.createCourseInfo(formattedData)
//       console.log('newCourse', newCourse)
//       toast.success('Курс создан')
//     } catch (error: any) {
//       console.error('Ошибка при создании курса:', error)

//       if (error.response) {
//         console.error('Детали ошибки:', error.response.data.message) // Ошибка от сервера
//         console.error('Статус:', error.response.status) // HTTP-статус
//         console.error('Заголовки:', error.response.headers) // Headers ответа
//       } else if (error.request) {
//         console.error('Запрос был отправлен, но нет ответа:', error.request)
//       } else {
//         console.error('Ошибка при настройке запроса:', error.message)
//       }

//       toast.error(
//         `Ошибка при создании курса: ${
//           error.response?.data?.message || 'Неизвестная ошибка'
//         }`
//       )
//     }
//   }

//   return (
//     <div className="w-full p-6 ">
//       <h1 className="text-3xl font-bold mb-8 text-center">
//         Создать новый курс
//       </h1>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           {/* Поле изображения */}
//           <FormField
//             control={form.control}
//             name="previewImage"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="block text-sm font-medium mb-2">
//                   Превью курса
//                 </FormLabel>
//                 <FormControl>
//                   <div
//                     className="relative group cursor-pointer"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary transition-colors">
//                       {previewUrl ? (
//                         <img
//                           src={previewUrl}
//                           alt="Предпросмотр"
//                           className="rounded-lg object-cover h-48 w-full"
//                         />
//                       ) : (
//                         <div className="space-y-3">
//                           <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
//                           <p className="text-muted-foreground">
//                             Нажмите для загрузки изображения
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             Рекомендуемый размер: 1200x600px
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       ref={fileInputRef}
//                       onChange={e => {
//                         field.onChange(e.target.files)
//                         handleImageUpload(e)
//                       }}
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage className="text-xs" />
//               </FormItem>
//             )}
//           />

//           {/* Основные поля */}
//           <div className="space-y-6">
//             <FormField
//               control={form.control}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Название курса</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="h-12 text-lg" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Описание курса</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       {...field}
//                       rows={4}
//                       className="min-h-[120px] text-base"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="prerequisites"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Необходимые знания</FormLabel>
//                     <FormControl>
//                       <Textarea {...field} rows={2} className="min-h-[80px]" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="space-y-6">
//                 <FormField
//                   control={form.control}
//                   name="duration"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>
//                         Продолжительность курса: {field.value} часов
//                       </FormLabel>
//                       <FormControl>
//                         <div className="flex gap-4 items-center">
//                           <Slider
//                             min={1}
//                             max={100}
//                             step={1}
//                             value={[field.value]}
//                             onValueChange={value => field.onChange(value[0])}
//                             className="flex-1"
//                           />
//                           <span className="w-16 text-center text-lg font-medium">
//                             {field.value} ч
//                           </span>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="difficulty"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Уровень сложности</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         value={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Выберите уровень" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {Object.values(Difficulty).map(level => (
//                             <SelectItem
//                               key={level}
//                               value={level}
//                               className="capitalize"
//                             >
//                               {level}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Цели обучения */}
//             <div>
//               <FormLabel>Чему научатся студенты</FormLabel>
//               <div className="mt-2 flex gap-2">
//                 <Input
//                   ref={objectiveInputRef}
//                   placeholder="Добавьте цель обучения"
//                   className="flex-1"
//                   onKeyDown={e => e.key === 'Enter' && addObjective()}
//                 />
//                 <Button
//                   type="button"
//                   onClick={addObjective}
//                   variant="outline"
//                   className="gap-2"
//                 >
//                   <PlusCircle className="h-4 w-4" />
//                   Добавить
//                 </Button>
//               </div>

//               {/* Список добавленных целей */}
//               <ul className="mt-4 space-y-2">
//                 {form.watch('objectives').map((obj, index) => (
//                   <li
//                     key={index}
//                     className="p-3 border-2 border-dashed rounded-lg flex justify-between items-center group"
//                   >
//                     <span className="text-foreground">{obj}</span>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="cursor-pointer"
//                       onClick={() => {
//                         const newObjectives = form
//                           .getValues('objectives')
//                           .filter((_, i) => i !== index)
//                         form.setValue('objectives', newObjectives)
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4 text-destructive" />
//                     </Button>
//                   </li>
//                 ))}
//               </ul>
//               {form.formState.errors.objectives && (
//                 <p className="text-sm font-medium text-destructive mt-2">
//                   {form.formState.errors.objectives.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <Button type="submit" className="w-full h-12 text-lg">
//             Далее
//           </Button>
//         </form>
//       </Form>
//     </div>
//   )
// }

'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Difficulty, ICourse } from '@/entities/course/model/types'
import { courseService } from '../../api/course.service'
import { fileService } from '@/shared/api/file-upload.service'
import { IoMdInformationCircle } from 'react-icons/io'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { BiSolidStopwatch } from 'react-icons/bi'
import { FaCheck, FaGripVertical } from 'react-icons/fa'

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
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
interface CoursePart {
  id: string
  title: string
  description: string
}

function SortableItem({ part }: { part: CoursePart }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: part.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 mb-4 bg-card rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <button {...attributes} {...listeners} className="cursor-move p-2">
        <FaGripVertical className="text-gray-400" />
      </button>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{part.title}</h3>
        <p className="text-gray-300 text-sm">{part.description}</p>
      </div>
    </div>
  )
}

const courseFormSchema = z.object({
  title: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов'),
  previewImage: z
    .instanceof(FileList)
    .refine(files => files.length > 0, 'Требуется изображение для превью')
    .refine(
      files => files[0]?.type.startsWith('image/'),
      'Файл должен быть изображением'
    ),
  prerequisites: z
    .string()
    .min(5, 'Необходимые знания должны содержать минимум 5 символов'),
  duration: z.coerce.number().min(1, 'Минимальная продолжительность - 1 час'),
  difficulty: z.nativeEnum(Difficulty),
  objectives: z
    .array(
      z.string().min(5, 'Цель обучения должна содержать минимум 5 символов')
    )
    .nonempty('Добавьте хотя бы одну цель обучения')
})

type CourseFormValues = z.infer<typeof courseFormSchema>

export default function CreateCourseForm() {
  const [parts, setParts] = useState<CoursePart[]>([
    {
      id: '1',
      title: 'Введение в курс',
      description: 'Основные концепции и введение в материал курса'
    },
    {
      id: '2',
      title: 'Базовые понятия',
      description: 'Изучение фундаментальных основ предмета'
    },
    {
      id: '3',
      title: 'Практические задания',
      description: 'Применение полученных знаний на практике'
    }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setParts(items => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectiveInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      prerequisites: '',
      duration: 1,
      difficulty: Difficulty.NEWBIE,
      objectives: []
    }
  })

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
      form.setValue('objectives', [...form.getValues().objectives, value])
      if (objectiveInputRef.current) {
        objectiveInputRef.current.value = ''
      }
    }
  }

  const onSubmit = async (data: CourseFormValues) => {
    try {
      const previewImageUrl = await fileService.uploadImage(
        data.previewImage[0]
      )
      const formattedData: ICourse = {
        title: data.title,
        description: data.description,
        previewImageUrl,
        prerequisites: data.prerequisites,
        duration: Number(data.duration),
        difficulty: data.difficulty,
        objectives: data.objectives.map(obj => ({ description: obj }))
      }

      const newCourse = await courseService.createCourseInfo(formattedData)
      toast.success('Курс создан')
    } catch (error: any) {
      console.error('Ошибка при создании курса:', error)
      toast.error(
        `Ошибка при создании курса: ${
          error.response?.data?.message || 'Неизвестная ошибка'
        }`
      )
    }
  }

  return (
    <div className="w-full p-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Верхний блок с основной информацией */}
          <div className="flex gap-4 border-b-2 pb-4">
            <div className="flex flex-col gap-4 w-4/5">
              {/* Уровень сложности и продолжительность */}
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <Badge className="capitalize">{field.value}</Badge>
                  )}
                />

                <div className="flex items-center gap-1">
                  <BiSolidStopwatch />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => <span>{field.value} ч</span>}
                  />
                </div>
              </div>

              {/* Название курса */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="font-bold md:text-3xl border-none p-0 focus-visible:ring-0"
                    placeholder="Название курса"
                  />
                )}
              />

              {/* Описание курса */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="text-gray-300  p-2 focus-visible:ring-0 resize-none w-full"
                    rows={6}
                    placeholder="Описание курса"
                  />
                )}
              />
            </div>

            {/* Загрузка изображения */}
            <div className="w-2/5">
              <FormField
                control={form.control}
                name="previewImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Предпросмотр"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-4 h-60 flex flex-col items-center justify-center text-center ">
                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">
                              Нажмите для загрузки изображения
                            </p>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={e => {
                            field.onChange(e.target.files)
                            handleImageUpload(e)
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Блок с карточками */}
          <div className="flex gap-10">
            {/* Карточка необходимых знаний */}
            <Card className="w-1/2 self-start">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                  <IoMdInformationCircle />
                  Необходимые знания
                </div>
                <FormField
                  control={form.control}
                  name="prerequisites"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="text-gray-300 border-none p-0 focus-visible:ring-0 resize-none"
                      rows={5}
                      placeholder="Опишите необходимые знания"
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Карточка целей обучения */}
            <Card className="w-1/2 self-start">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                  <HiOutlineLightningBolt />
                  Чему вы научитесь?
                </div>

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
                    {form.watch('objectives').map((obj, index) => (
                      <li key={index} className="flex items-center gap-2 pb-1">
                        <FaCheck className="text-green-500" />
                        <span className="flex-1">{obj}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newObjectives = form
                              .getValues('objectives')
                              .filter((_, i) => i !== index)
                            form.setValue('objectives', newObjectives)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Блок продолжительности и сложности */}
          <div className="grid grid-cols-2 gap-6 px-5">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-2">Части курса</h2>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={parts}
                strategy={verticalListSortingStrategy}
              >
                {parts.map(part => (
                  <SortableItem key={part.id} part={part} />
                ))}
              </SortableContext>
            </DndContext>

            <Button
              onClick={() => {
                const newPart = {
                  id: (parts.length + 1).toString(),
                  title: `Новая часть ${parts.length + 1}`,
                  description: 'Описание новой части курса'
                }
                setParts([...parts, newPart])
              }}
            >
              Добавить часть
            </Button>
          </div>
          <div className="">
            <Button type="submit" className="w-full h-12 text-lg">
              Создать курс
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
