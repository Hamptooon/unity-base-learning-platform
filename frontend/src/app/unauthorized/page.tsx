'use client'
import { LockKeyholeIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function Unauthorized() {
  useEffect(() => {
    document.title = 'Требуется авторизация | ВашСайт'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

          <CardHeader className="items-center text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <LockKeyholeIcon className="h-16 w-16 text-primary/80" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Доступ ограничен
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground text-lg">
              Для просмотра этой страницы необходимо авторизоваться в системе
            </p>

            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/login">
                <LockKeyholeIcon className="h-4 w-4" />
                Войти c Github
              </Link>
            </Button>
          </CardContent>

          <CardFooter className="justify-center">
            <Alert className="border-primary/20 bg-primary/5">
              <AlertDescription className="text-sm text-primary/80">
                Нет аккаунта на Github?{' '}
                <Link
                  href="/register"
                  className="font-semibold hover:underline underline-offset-4"
                >
                  Зарегистрируйтесь
                </Link>
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
