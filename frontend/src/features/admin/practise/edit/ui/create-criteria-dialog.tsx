'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/shared/ui/form'
import { practiseService } from '@/entities/practise/api/practise.service'
import { Textarea } from '@/shared/ui/textarea'
import { z } from 'zod'
const criteriaSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10)
})

export function CreateCriteriaDialog({
  practiceId,
  criteria,
  onSuccess,
  children
}: {
  practiceId?: string
  criteria?: any
  onSuccess: (criteria: any) => void
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: zodResolver(criteriaSchema),
    defaultValues: criteria || { title: '', description: '' }
  })

  const handleSubmit = form.handleSubmit(async values => {
    try {
      if (!practiceId) return

      const result = criteria
        ? await practiseService.updateCriteria(practiceId, criteria.id, values)
        : await practiseService.createCriteria(practiceId, values)

      onSuccess(result)
      setOpen(false)
      toast.success(`Критерий ${criteria ? 'обновлён' : 'добавлен'}`)
    } catch (error) {
      toast.error('Ошибка сохранения')
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {criteria ? 'Редактирование критерия' : 'Новый критерий'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Критерий соответствия" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Подробное описание критерия"
                      rows={4}
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
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="button" onClick={handleSubmit}>
                Сохранить
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
