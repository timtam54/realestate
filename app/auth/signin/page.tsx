'use client'

import Login from '@/components/Login'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleClose = () => {
    router.push('/')
  }

  return <Login onClose={handleClose} callbackUrl={callbackUrl} />
}
