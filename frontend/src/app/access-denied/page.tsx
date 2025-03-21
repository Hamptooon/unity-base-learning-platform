'use client'
import { useUser } from '@/features/auth/provider/user-provider'

export default function AccessDenied() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Упс доступ запрещен</h1>
    </div>
  )
}
