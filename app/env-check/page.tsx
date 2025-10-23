'use client'

import { useEffect, useState } from 'react'

export default function EnvCheckPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return <div>Loading...</div>
  
  const envVars = {
    NEXT_PUBLIC_AZUREBLOB_SASTOKEN: process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_AZUREBLOB_SASURL_BASE: process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || 'NOT SET',
    NEXT_PUBLIC_AZUREBLOB_CONTAINER: process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || 'NOT SET',
    NEXT_PUBLIC_GOOGLE_MAP_API: process.env.NEXT_PUBLIC_GOOGLE_MAP_API ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || 'NOT SET',
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'NOT SET',
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Client-Side Environment Variables Check</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
}