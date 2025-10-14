'use client'

import { useState } from 'react'
import { Home, DollarSign, Camera, FileText, Shield, MessageSquare, CheckCircle, ArrowRight, Users, Zap, Calculator } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How much does it cost to list my property?",
    answer: "It's a flat fee of $500 to list your property. No hidden costs, no percentage commissions. Additional services like professional photography or building inspections are available as optional add-ons."
  },
  {
    question: "Do I need a Contract of Sale before listing?",
    answer: "Yes, Queensland law requires a Contract of Sale to be prepared before advertising. Our platform connects you with licensed conveyancers who will prepare this for you as part of the listing process."
  },
  {
    question: "How long does it take to list my property?",
    answer: "Most sellers complete the listing process in under 30 minutes. However, you'll need your Contract of Sale ready, which typically takes 2-3 business days to prepare through our conveyancer network."
  },
  {
    question: "Can I edit my listing after it's published?",
    answer: "Yes! You can update photos, description, and price anytime from your seller dashboard. Changes are reflected immediately on the platform."
  },
  {
    question: "How do I handle property viewings?",
    answer: "You&apos;re in complete control. Arrange viewings directly with interested buyers through our secure messaging system. Share your contact details only when you&apos;re ready."
  },
  {
    question: "What if I need help during the sale process?",
    answer: "Our support team is available via email and phone. Plus, our verified conveyancer partners can guide you through the legal aspects of the sale."
  }
]

export default function HowToSellPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="font-bold text-xl">BuySel</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/seller/dashboard" className="text-gray-700 hover:text-blue-600">
                My Dashboard
              </Link>
              <button asChild>
                <Link href="/seller/list-property">List Property</Link>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sell Your Property Without Agent Commission
          </h1>
          <p className="text-xl mb-8">
            Keep 100% of your sale price. Pay only a flat $500 listing fee.
          </p>
          <div className="flex justify-center space-x-4">
            <button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/seller/list-property">
                Start Listing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </button>
            <button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700" asChild>
              <Link href="#calculator">
                Calculate Savings
                <Calculator className="ml-2 h-5 w-5" />
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Sell with BuySel?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Save Thousands</h3>
              <p className="text-gray-600">
                No agent commission means you keep 100% of your sale price. Save $15,000-$30,000 on average.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified & Trusted</h3>
              <p className="text-gray-600">
                Build buyer confidence with verification badges for compliance, inspections, and documentation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Direct to Buyers</h3>
              <p className="text-gray-600">
                Connect directly with serious buyers through our secure messaging platform.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
              <p className="text-gray-600">
                List your property in under 30 minutes with our simple 5-step wizard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
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
                  Use our simple 5-step wizard to create your listing:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Property Details:</strong> Address, bedrooms, bathrooms, features</li>
                  <li><strong>Pricing:</strong> Set your asking price and negotiation preferences</li>
                  <li><strong>Photos & Media:</strong> Upload high-quality photos (we recommend professional photography)</li>
                  <li><strong>Compliance:</strong> Add verification badges to build trust</li>
                  <li><strong>Payment:</strong> Pay the $500 listing fee to go live</li>
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
        </div>
      </section>

      {/* Savings Calculator */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Calculate Your Savings</h2>
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Traditional Agent Sale</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sale Price:</span>
                    <span className="font-medium">$750,000</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Agent Commission (2.5%):</span>
                    <span className="font-medium">-$18,750</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Marketing Costs:</span>
                    <span className="font-medium">-$2,000</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>You Receive:</span>
                    <span>$729,250</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">BuySel</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sale Price:</span>
                    <span className="font-medium">$750,000</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Listing Fee:</span>
                    <span className="font-medium">-$500</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Optional Extras:</span>
                    <span className="font-medium">-$0</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-green-600">
                    <span>You Receive:</span>
                    <span>$749,500</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <div className="bg-green-100 rounded-lg p-4 inline-block">
                <p className="text-2xl font-bold text-green-800">You Save $20,250!</p>
                <p className="text-green-700 mt-1">That&apos;s money in your pocket, not the agent&apos;s</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Optional Services to Boost Your Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Camera className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Professional Photography</h3>
              <p className="text-gray-600 mb-4">
                High-quality photos can increase interest by up to 40%. Our verified photographers know how to 
                showcase your property&apos;s best features.
              </p>
              <p className="text-2xl font-bold text-blue-600">From $350</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <FileText className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Building & Pest Inspection</h3>
              <p className="text-gray-600 mb-4">
                Pre-sale inspections build buyer confidence and can speed up the sale process. Get your 
                verification badge today.
              </p>
              <p className="text-2xl font-bold text-green-600">From $450</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Shield className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Contract Preparation</h3>
              <p className="text-gray-600 mb-4">
                Required by law in Queensland. Our licensed conveyancers prepare your Contract of Sale 
                quickly and accurately.
              </p>
              <p className="text-2xl font-bold text-purple-600">From $550</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  <span className="text-2xl text-gray-400">
                    {expandedFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Thousands?</h2>
          <p className="text-xl mb-8">
            Join hundreds of Queensland homeowners who&apos;ve sold without agent commission.
          </p>
          <div className="flex justify-center space-x-4">
            <button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/seller/list-property">
                List Your Property Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </button>
            <button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700" asChild>
              <Link href="/contact">
                Talk to Us First
                <MessageSquare className="ml-2 h-5 w-5" />
              </Link>
            </button>
          </div>
          <p className="mt-6 text-blue-100">
            No obligation. No hidden fees. Just $500 to list.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 BuySel. Helping Queensland homeowners sell smarter.
          </p>
        </div>
      </footer>
    </div>
  )
}