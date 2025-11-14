'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Footer from '@/components/Footer'
import { usePageView } from '@/hooks/useAudit'

function DataDeletionContent() {
  usePageView('data-deletion-status')
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Deletion Request</h1>
        
        {code ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Request Received</h2>
              <p className="text-green-800">
                Your data deletion request has been received and is being processed.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Confirmation Code:</strong> {code}
              </p>
            </div>

            <div className="space-y-2 text-gray-700">
              <h3 className="font-semibold text-gray-900">What happens next:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account data will be deleted within 30 days</li>
                <li>You will receive a confirmation email once the deletion is complete</li>
                <li>All personal information associated with your account will be permanently removed</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="pt-4 text-sm text-gray-600">
              <p>
                If you have any questions or concerns, please contact us at{' '}
                <a href="mailto:privacy@buysel.com" className="text-[#FF6600] hover:underline">
                  privacy@buysel.com
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              This page is used to track data deletion requests from Facebook.
            </p>
            <p className="text-gray-700">
              If you would like to delete your account data, please sign in to your account and visit your account settings.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function DataDeletionStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <DataDeletionContent />
    </Suspense>
  )
}
