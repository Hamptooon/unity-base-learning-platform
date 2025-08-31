'use client'
import { useUser } from '@/features/auth/provider/user-provider'
import { FaLock } from 'react-icons/fa'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { FaExclamationTriangle } from 'react-icons/fa'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/shared/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

export default function AccessDenied() {
  const { user } = useUser()

  useEffect(() => {
    document.title = 'Доступ запрещен | ВашСайт'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto animate-shake">
            <FaLock className="h-12 w-12 text-destructive " />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Доступ ограничен
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {user
              ? 'Ваша учетная запись не имеет необходимых прав доступа'
              : 'Требуется авторизация для просмотра этой страницы'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {!user ? (
            <Button asChild variant="default" className="w-full">
              <Link href="/login">Войти в систему</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Вернуться на главную</Link>
            </Button>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTitle className="text-sm font-medium flex items-center gap-2">
              <FaExclamationTriangle className="h-4 w-4" />
              Ошибка доступа
            </AlertTitle>
            <AlertDescription className="text-sm text-destructive/80">
              Если это ошибка, обратитесь в поддержку
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}
