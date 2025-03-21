'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { axiosClassic, axiosWithAuth } from '@/shared/api/axios'
import { toast } from 'react-toastify'

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailVerificationToken = params.get('emailVerificationToken')
    console.log(emailVerificationToken)
    const verifyEmail = async () => {
      try {
        const { data } = await axiosClassic.get(
          `/auth/verify-email?token=${emailVerificationToken}`
        )
        console.log(data)
        console.log('verify')
        toast.success('Email подтвержден')
        router.push('/')
      } catch (error) {
        console.log('error verify')
      }
    }
    verifyEmail()
  }, [router])

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">Подтверждение почты...</h1>
      <p>Пожалуйста, подождите</p>
    </div>
  )
}
