'use client'
import CreateCourseForm from '@/features/admin/course/create-course/ui/create-course-form'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'

import { IoMdInformationCircle } from 'react-icons/io'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { BiSolidStopwatch } from 'react-icons/bi'
import { FaCheck, FaGripVertical } from 'react-icons/fa'
import { Button } from '@/shared/ui/button'
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
import { useState } from 'react'

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

export default function CreateCourseParts() {
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
  return (
    <div className="w-full">
      <div className="grid grid-rows-1 md:grid-rows-2 gap-10 p-5">
        <div className="flex gap-4 border-b-2 pb-4">
          <div className="flex flex-col gap-4 w-4/5">
            <div className="flex items-center gap-4">
              <Badge>NEWBIE</Badge>

              <div className="flex items-center gap-1">
                <BiSolidStopwatch /> 10 ч
              </div>
            </div>
            <div className="font-bold text-3xl">Название курса</div>
            <div className="text-gray-300">
              Описание курса Lorem ipsum dolor, sit amet consectetur adipisicing
              elit. Ipsam id explicabo similique corporis magni culpa reiciendis
              laboriosam blanditiis modi suscipit magnam, tempore illum totam
              voluptatem assumenda natus eligendi omnis praesentium! Magni ex,
              eaque minus minima reprehenderit nulla aliquam iusto ab sapiente
              alias repellendus fugiat voluptatem pariatur hic assumenda eos
              illum qui maxime amet, repudiandae possimus necessitatibus.
              Corporis id temporibus aut.Reiciendis, architecto odit.
            </div>
          </div>
          <div className="w-2/5">
            <img
              src="https://img-c.udemycdn.com/course/750x422/1210008_6859.jpg"
              alt=""
            />
          </div>
        </div>

        <div className="flex gap-10 px-10 border-b-2  h-auto">
          <Card className="hover:shadow-lg transition-shadow duration-200 w-1/2 justify-center max-h-50 self-center">
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                <IoMdInformationCircle />
                Необходимые знания
              </div>
              <div className="text-gray-300">
                It would be best to have a basic understanding of HTML and CSS.
                If you still need to learn the fundamentals, we link to some
                excellent resources inside the path. We recommend starting the
                path and using the resources to boost your knowledge before
                tackling the first challenge.
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200 w-1/2 justify-center max-h-50 self-center">
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-bold pb-3">
                <HiOutlineLightningBolt />
                Чему вы научитесь?
              </div>
              <div>
                <ul>
                  <li className="flex items-center gap-2 pb-1">
                    <FaCheck />
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </li>
                  <li className="flex items-center gap-2 pb-1">
                    <FaCheck />
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </li>
                  <li className="flex items-center gap-2 pb-1">
                    <FaCheck />
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
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

        <Button>Назад</Button>
      </div>
    </div>
  )
}
