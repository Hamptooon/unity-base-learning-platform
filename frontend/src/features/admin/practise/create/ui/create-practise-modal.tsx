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
import { practiseService } from '@/entities/practise/api/practise.service'
import { toast } from 'react-toastify'
import {
  CreatePracticeFormValues,
  practiceCreateFormSchema
} from '../model/validation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
export default function CreatePracticeModal() {
  const form = useForm<CreatePracticeFormValues>({
    resolver: zodResolver(practiceCreateFormSchema),
    defaultValues: {
      title: '',
      description: ''
      //   difficulty: 'NEWBIE',
      //   duration: 1
    }
  })
  const router = useRouter()

  const onSubmit = async (data: CreatePracticeFormValues) => {
    try {
      const newPractice = await practiseService.createPractise(data)
      toast.success('Практика создана')
      router.push(`/admin/practises/edit/${newPractice.id}`)
    } catch (error) {
      toast.error('Ошибка при создании практики')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Создать Практику
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создание практики</DialogTitle>
          <DialogDescription>Напишите описании практики.</DialogDescription>
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
                    <Input {...field} placeholder="Название практики" />
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
                      placeholder="Описание практики"
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
