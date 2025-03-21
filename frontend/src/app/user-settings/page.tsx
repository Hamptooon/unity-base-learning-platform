'use client'
import { useEffect } from 'react'
import { useUser } from '@/features/auth/provider/user-provider'
import { authService } from '@/features/auth/api/auth.service'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { currentUserService } from '@/features/userSettings/api/user-settings.service'
const profileSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Неверный email'),
  bio: z.string().max(500, 'Максимум 500 символов')
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Home() {
  const { user, isLoading, setUser, refetchUser } = useUser()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Включаем валидацию при изменении
    defaultValues: {
      name: '',
      email: '',
      bio: ''
    }
  })

  // Обновляем значения формы при загрузке пользователя
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        bio: user.bio || ''
      })
    }
  }, [user, form])

  const handleResendEmail = async () => {
    try {
      await authService.resendVerification()
      toast.success('Письмо отправлено')
    } catch (error) {
      toast.error('Ошибка при отправке письма')
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updatedUser = await currentUserService.updateUserInfo(data)
      console.log('updatedUser')
      console.log(updatedUser)
      setUser(updatedUser)
      // await refetchUser()
      toast.success('Профиль обновлен')
    } catch (error) {
      toast.error('Ошибка при обновлении профиля')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : user ? (
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Поле имени */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Введите ваше имя" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Поле email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="Введите ваш email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Поле описания */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="min-h-[100px]"
                        placeholder="Расскажите о себе"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Блок подтверждения email */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email подтвержден:</p>
                    <p>{user.emailVerified ? 'Да' : 'Нет'}</p>
                  </div>
                  {!user.emailVerified && (
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      type="button"
                    >
                      Отправить письмо повторно
                    </Button>
                  )}
                </div>
              </div>

              {/* Кнопки управления */}
              <div className="flex gap-2 justify-end">
                <Button type="submit">Сохранить изменения</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Сбросить изменения
                </Button>
              </div>
            </form>
          </Form>

          {/* Статическая информация */}
          <div className="space-y-2">
            <div>
              <p className="font-medium">Роль:</p>
              <p>{user.role}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Пожалуйста, войдите для просмотра контента</p>
      )}
    </div>
  )
}
