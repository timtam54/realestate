'use client'

import { CheckCircle } from 'lucide-react'
import BuySelHeader from '@/components/BuySelHeader'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function HowItWorksPage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <BuySelHeader user={user} isAuthenticated={isAuthenticated} />

      {/* Early Access Banner */}
      <div className="bg-gradient-to-r from-[#FF6600] to-orange-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold">
            🎉 Free to list during early access - No listing fees!
          </p>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How to Sell Your Property</h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                1
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-xl mb-2">Prepare Your Documents</h3>
                <p className="text-gray-600 mb-3">
                  Before listing, you&apos;ll need a Contract of Sale. Our conveyancer partners can prepare this for you, 
                  typically within 2-3 business days. You&apos;ll also want to gather:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Property title details</li>
                  <li>Recent council rates notice</li>
                  <li>Any existing inspection reports</li>
                  <li>Pool safety certificate (if applicable)</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                2
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-xl mb-2">Create Your Listing</h3>
                <p className="text-gray-600 mb-3">
                  Use our simple 5-step wizard to create your listing. <strong className="text-[#FF6600]">Free to list during early access.</strong>
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Property Details:</strong> Address, bedrooms, bathrooms, features</li>
                  <li><strong>Pricing:</strong> Set your asking price and negotiation preferences</li>
                  <li><strong>Photos & Media:</strong> Upload high-quality photos (we recommend professional photography)</li>
                  <li><strong>Compliance:</strong> Add verification badges to build trust</li>
                  <li><strong>Payment:</strong> Go live with no listing fees</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                3
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-xl mb-2">Add Verification Badges</h3>
                <p className="text-gray-600 mb-3">
                  Stand out from other listings by adding verification badges. Each badge shows buyers that your 
                  property meets important compliance requirements:
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Contract of Sale Ready</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Smoke Alarms Certified</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Building & Pest Report</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Professional Photos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                4
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-xl mb-2">Connect with Buyers</h3>
                <p className="text-gray-600 mb-3">
                  Once live, interested buyers can message you through our secure platform. You&apos;re in control:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Messages are PII-masked until both parties consent to share contact details</li>
                  <li>Schedule viewings at times that suit you</li>
                  <li>Negotiate directly with buyers</li>
                  <li>Access buyer verification status</li>
                </ul>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                5
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-xl mb-2">Complete the Sale</h3>
                <p className="text-gray-600 mb-3">
                  When you accept an offer, our conveyancer network is here to help:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Handle contract negotiations and amendments</li>
                  <li>Manage the settlement process</li>
                  <li>Coordinate with the buyer&apos;s representatives</li>
                  <li>Ensure all legal requirements are met</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <Link 
              href="/seller"
              className="inline-block bg-[#FF6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#FF5500] transition-colors"
            >
              Start Listing Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
