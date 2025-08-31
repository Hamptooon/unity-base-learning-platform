'use client'
import '@blocknote/core/fonts/inter.css'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'
import { memo, useEffect, useState, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { FaGripVertical } from 'react-icons/fa'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { CoursePart, CoursePartType } from '@/entities/course/model/types'
import { CourseFormValues } from '@/features/admin/course/edit-course/model/validation-schema'
import { Trash2, UploadCloud } from 'lucide-react'
import { InputImageUpload } from '@/shared/ui/input-image-upload'
import { InputUnityPackageUpload } from '@/shared/ui/input-unity-package-upload'
import { Button } from '@/shared/ui/button'
import { CreateCriteriaDialog } from './create-criteria-dialog'
import { ReviewCriteria } from '@/entities/course/model/types'
import { courseService } from '@/entities/course/api/course.service'
import { toast } from 'react-toastify'
import { Pencil, PlusCircle } from 'lucide-react'
interface SortableItemProps {
  part: CoursePart
  index: number
  isOpen: boolean
  fieldIndex: number
  courseId: string
  onToggle: () => void
  onDelete: (partId: string) => void
}
export const SortableItem: React.FC<SortableItemProps> = memo(
  ({ part, index, onToggle, onDelete, fieldIndex, isOpen, courseId }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: part.id })
    const [criteriaList, setCriteriaList] = useState<ReviewCriteria[]>([])
    const { control, setValue, getValues } = useFormContext<CourseFormValues>()

    const loadCriteria = async () => {
      if (part.coursePracticeTaskId) {
        const data = await courseService.getReviewCriterias(
          courseId,
          part.id!,
          part.coursePracticeTaskId!
        )
        setCriteriaList(data)
      }
    }

    useEffect(() => {
      if (isOpen && part.practice) {
        loadCriteria()
      }
    }, [isOpen])

    const handleDeleteCriteria = async (criteriaId: string) => {
      try {
        await courseService.deleteReviewCriteria(
          courseId,
          part.id!,
          part.coursePracticeTaskId!,
          criteriaId
        )
        setCriteriaList(prev => prev.filter(c => c.id !== criteriaId))
        toast.success('Критерий успешно удалён')
      } catch (error) {
        toast.error('Ошибка удаления критерия')
      }
    }
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    }

    const editor = useCreateBlockNote()

    const handleEditorChange = async () => {
      const html = (await editor.blocksToFullHTML(editor.document)) as string
      if (part.article) {
        setValue(`parts.${fieldIndex}.article.content`, html)
      } else if (part.practice) {
        setValue(`parts.${fieldIndex}.practice.content`, html)
      }
    }
    useEffect(() => {
      if (part.article?.content) {
        editor.tryParseHTMLToBlocks(part.article.content).then(blocks => {
          editor.replaceBlocks(editor.document, blocks)
        })
      }
      if (part.practice?.content) {
        editor.tryParseHTMLToBlocks(part.practice.content).then(blocks => {
          editor.replaceBlocks(editor.document, blocks)
        })
      }
    }, [])

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-4 border rounded-lg overflow-hidden bg-card"
      >
        <div className="flex items-center gap-4 p-4 cursor-pointer">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-move p-2"
            onClick={e => e.stopPropagation()}
          >
            <FaGripVertical className="text-gray-400" />
          </button>

          <Badge className="text-lg font-bold">{index}</Badge>

          <div className="flex-1" onClick={onToggle}>
            <div className="flex items-center gap-2">
              <FormField
                control={control}
                name={`parts.${fieldIndex}.title`}
                render={({ field }) => (
                  <h3 className="font-bold text-lg">{field.value}</h3>
                )}
              />
              <Badge variant="outline">
                {part.type === CoursePartType.THEORETICAL
                  ? 'Теория'
                  : 'Практика'}
              </Badge>
            </div>
            <FormField
              control={control}
              name={`parts.${fieldIndex}.description`}
              render={({ field }) => (
                <p className="text-gray-300 text-sm">{field.value}</p>
              )}
            />
          </div>

          <button
            type="button"
            className=" text-destructive hover:bg-destructive/10 rounded-full"
            onClick={() => onDelete(part.id!)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            height: isOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-4 border-t">
            <div className="pl-10 mb-5">
              <FormField
                control={control}
                name={`parts.${fieldIndex}.id`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="hidden"
                        placeholder="Id курса"
                        value={part.id}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`parts.${fieldIndex}.sortOrder`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="hidden"
                        placeholder="Order курса"
                        value={part.sortOrder}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`parts.${fieldIndex}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs">
                      Название части
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="font-bold md:text-xl border-none p-0 focus-visible:ring-0 mb-5"
                        placeholder="Название курса"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`parts.${fieldIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs">
                      Описание части
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="font-bold md:text-sm border-none p-0 focus-visible:ring-0"
                        placeholder="Описание курса"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-2/5 flex flex-col gap-5">
                <InputImageUpload
                  key={part.previewImageUrl}
                  fieldName={`parts.${fieldIndex}.previewImage`}
                  previewImageUrl={part.previewImageUrl}
                />
                {part.practice && (
                  <>
                    <InputUnityPackageUpload
                      fieldName={`parts.${fieldIndex}.practice.assetsFile`}
                      initialFileUrl={part.practice.assetsFileUrl}
                    />
                    <Button className="cursor-pointer" type="button">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/files/${part.practice.assetsFileUrl}`}
                      >
                        Скачать
                      </a>
                    </Button>
                  </>
                )}
              </div>
              {part.practice && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Критерии оценки</h4>
                    <CreateCriteriaDialog
                      courseId={courseId}
                      partId={part.id!}
                      practiseId={part.coursePracticeTaskId!}
                      onSuccess={loadCriteria}
                    >
                      <Button size="sm" variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Добавить критерий
                      </Button>
                    </CreateCriteriaDialog>
                  </div>

                  <div className="space-y-2">
                    {criteriaList.map(criteria => (
                      <div key={criteria.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{criteria.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              {criteria.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <CreateCriteriaDialog
                              courseId={courseId}
                              partId={part.id!}
                              practiseId={part.coursePracticeTaskId!}
                              criteria={criteria}
                              onSuccess={loadCriteria}
                            >
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </CreateCriteriaDialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              className="text-destructive"
                              onClick={() => handleDeleteCriteria(criteria.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <BlockNoteView editor={editor} onChange={handleEditorChange} />
          </div>
        </motion.div>
      </div>
    )
  }
)
