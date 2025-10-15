'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Seller page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full bg-[#FF6600] text-white px-4 py-2 rounded-lg hover:bg-[#FF5500] transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Go to home page
            </Link>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs text-gray-700 font-semibold mb-2">
              Technical Details:
            </p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
              {error.stack || error.message}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
