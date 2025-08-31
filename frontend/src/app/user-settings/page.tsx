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
import { Badge } from '@/shared/ui/badge'
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
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Настройки</h1>

        {isLoading ? (
          <p className="text-center">Загрузка...</p>
        ) : user ? (
          <div className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Имя */}
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

                {/* Email */}
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

                {/* Описание */}
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

                {/* Email подтверждение */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Email подтвержден:</p>
                      {user.emailVerified ? (
                        <Badge variant="default">Подтвержден</Badge>
                      ) : (
                        <Badge variant="destructive">Не подтвержден</Badge>
                      )}
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

                {/* Кнопки */}
                <div className="flex gap-3 justify-end pt-4">
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
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Пожалуйста, войдите для просмотра контента
          </p>
        )}
      </div>
    </div>
  )
}
