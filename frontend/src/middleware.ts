// app/middleware.ts
console.log('Middleware is running')
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose' // Импортируем библиотеку для работы с JWT на стороне клиента

// Пути, требующие авторизации обычного пользователя
const userProtectedPaths = ['/profile', '/settings', '/user-settings']

// Пути, требующие прав администратора
const adminProtectedPaths = ['/admin', '/dashboard', '/users-management']

export async function middleware(request: NextRequest) {
  // Получаем accessToken из cookies
  const accessToken = request.cookies.get('accessToken')?.value

  // Текущий путь
  const path = request.nextUrl.pathname

  // Проверяем, является ли путь защищенным
  const isUserProtectedPath = userProtectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  )

  const isAdminProtectedPath = adminProtectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  )
  console.log('middleware')
  // Если путь защищен, но токена нет - редирект на страницу логина
  if ((isUserProtectedPath || isAdminProtectedPath) && !accessToken) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Если есть токен и путь требует проверки - проверяем роль
  if (accessToken && (isUserProtectedPath || isAdminProtectedPath)) {
    try {
      // Верифицируем JWT токен (используем секретный ключ, который должен совпадать с серверным)
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(accessToken, JWT_SECRET)

      // Проверяем доступ к путям для администратора
      if (isAdminProtectedPath && payload.role !== 'ADMIN') {
        // Если пользователь не admin, но пытается получить доступ к админской странице
        return NextResponse.redirect(new URL('/access-denied', request.url))
      }
    } catch (error) {
      // Если токен недействителен или истек срок действия, перенаправляем на обновление токена
      const response = NextResponse.redirect(
        new URL('/auth/refresh', request.url)
      )

      // Сохраняем оригинальный URL для редиректа после обновления токена
      response.cookies.set('redirectUrl', request.url)
      return response
    }
  }

  return NextResponse.next()
}

// Указываем, на каких путях запускается middleware
export const config = {
  matcher: [
    /*
     * Указываем все защищенные пути
     */
    '/profile/:path*',
    '/user-settings/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/users-management/:path*'
  ]
}
