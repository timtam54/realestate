'use client'

import Login from '@/components/Login'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/')
  }

  return <Login onClose={handleClose} />
}
