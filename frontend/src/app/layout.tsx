import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/widgets/header/header'
import { UserProvider } from '@/features/auth/provider/user-provider'
import ToastProvider from '@/shared/provider/toastProvider'
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ToastProvider />
        <UserProvider>
          <Header />
          <main className="">{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
