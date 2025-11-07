'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Authentication Error</h1>
      <p><strong>Error:</strong> {error}</p>
      <p><strong>Error Details:</strong></p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        {JSON.stringify({
          error,
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          timestamp: new Date().toISOString()
        }, null, 2)}
      </pre>
      <button onClick={() => window.location.href = '/auth/signin'}>
        Try Again
      </button>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
