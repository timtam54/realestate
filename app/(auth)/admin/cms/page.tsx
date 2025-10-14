'use client'

import { useState } from 'react'
import { FileText, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface CMSContent {
  homepage: {
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    trustBadgesTitle: string
    trustBadgesDescription: string
    howItWorksTitle: string
    howItWorksSteps: {
      id: string
      title: string
      description: string
      order: number
    }[]
    ctaTitle: string
    ctaDescription: string
    ctaButtonText: string
  }
  faqs: {
    id: string
    question: string
    answer: string
    category: string
    order: number
  }[]
  terms: {
    lastUpdated: string
    content: string
  }
  privacy: {
    lastUpdated: string
    content: string
  }
}

const mockCMSContent: CMSContent = {
  homepage: {
    heroTitle: 'Sell your house. Keep your price.',
    heroSubtitle: 'Verified property. No commission. Flat $500 listing fee.',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    trustBadgesTitle: 'Trust what you see',
    trustBadgesDescription: 'Every listing shows verified compliance badges. Look for green ticks to ensure properties meet all legal requirements and have been professionally documented.',
    howItWorksTitle: 'How It Works',
    howItWorksSteps: [
      {
        id: '1',
        title: 'List Your Property',
        description: 'Complete our simple 5-step wizard. Get your Contract of Sale prepared by our licensed conveyancer partners.',
        order: 1
      },
      {
        id: '2',
        title: 'Get Verified',
        description: 'Add compliance badges like smoke alarms, pool safety, and building & pest reports to build buyer trust.',
        order: 2
      },
      {
        id: '3',
        title: 'Connect with Buyers',
        description: 'Receive messages through our secure platform. Share contact details only when you\'re ready.',
        order: 3
      }
    ],
    ctaTitle: 'Ready to sell without commission?',
    ctaDescription: 'List your property for a flat $500 fee. No hidden costs, no percentage commissions.',
    ctaButtonText: 'Start Listing Now'
  },
  faqs: [
    {
      id: 'FAQ001',
      question: 'How much does it cost to list a property?',
      answer: 'It costs a flat fee of $500 to list your property. This includes the basic listing and access to our conveyancer network. Additional services like professional photography or building inspections are available as optional add-ons.',
      category: 'Pricing',
      order: 1
    },
    {
      id: 'FAQ002',
      question: 'Do I need a Contract of Sale before listing?',
      answer: 'Yes, Queensland law requires a Contract of Sale to be prepared before advertising a property. Our platform connects you with licensed conveyancers who will prepare this for you as part of the listing process.',
      category: 'Legal',
      order: 2
    },
    {
      id: 'FAQ003',
      question: 'How do the verification badges work?',
      answer: 'Verification badges show buyers that your property meets important compliance requirements. Each badge is verified by a licensed professional and displays on your listing with the verifier\'s details and verification date.',
      category: 'Features',
      order: 3
    }
  ],
  terms: {
    lastUpdated: '2024-01-15',
    content: `# Terms and Conditions

## 1. Acceptance of Terms
By accessing and using BuySel, you accept and agree to be bound by these Terms and Conditions.

## 2. Service Description
BuySel provides a platform for property sellers to list properties without traditional real estate agent commissions.

## 3. Fees and Payments
- Listing fee: $500 (non-refundable except as outlined in our refund policy)
- Additional services are available for optional purchase
- All fees must be paid before a listing can be published

## 4. Seller Responsibilities
Sellers must:
- Provide accurate and truthful information
- Obtain required legal documentation (Contract of Sale)
- Comply with all applicable laws and regulations`
  },
  privacy: {
    lastUpdated: '2024-01-15',
    content: `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, list a property, or contact us.

## 2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages

## 3. Information Sharing
We do not sell, trade, or rent your personal information to third parties.`
  }
}

export default function AdminCMSPage() {
  const [content, setContent] = useState(mockCMSContent)
  const [activeTab, setActiveTab] = useState<'homepage' | 'faqs' | 'terms' | 'privacy'>('homepage')
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null)
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'General' })
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log('Saving CMS content:', content)
    setUnsavedChanges(false)
    alert('Content saved successfully!')
  }

  const updateHomepage = (field: string, value: string | string[]) => {
    setContent({
      ...content,
      homepage: {
        ...content.homepage,
        [field]: value
      }
    })
    setUnsavedChanges(true)
  }

  const updateHowItWorksStep = (id: string, field: string, value: string) => {
    setContent({
      ...content,
      homepage: {
        ...content.homepage,
        howItWorksSteps: content.homepage.howItWorksSteps.map(step =>
          step.id === id ? { ...step, [field]: value } : step
        )
      }
    })
    setUnsavedChanges(true)
  }

  const addFAQ = () => {
    if (newFAQ.question && newFAQ.answer) {
      const newFAQItem = {
        id: `FAQ${Date.now()}`,
        ...newFAQ,
        order: content.faqs.length + 1
      }
      setContent({
        ...content,
        faqs: [...content.faqs, newFAQItem]
      })
      setNewFAQ({ question: '', answer: '', category: 'General' })
      setUnsavedChanges(true)
    }
  }

  const deleteFAQ = (id: string) => {
    setContent({
      ...content,
      faqs: content.faqs.filter(faq => faq.id !== id)
    })
    setUnsavedChanges(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <span className="font-bold text-xl">Admin Console</span>
                <span className="text-sm text-gray-400 block">Content Management</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unsavedChanges && (
                <span className="text-yellow-400 text-sm">Unsaved changes</span>
              )}
              <button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={!unsavedChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
              <Link href="/admin/dashboard" className="px-4 py-2 text-white border border-white rounded hover:bg-gray-800 inline-flex items-center">
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Overview
            </Link>
            <Link href="/admin/listings" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Listings
            </Link>
            <Link href="/admin/users" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/partners" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Partners
            </Link>
            <Link href="/admin/payments" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Payments
            </Link>
            <Link href="/admin/cms" className="px-3 py-2 text-sm font-medium bg-gray-900 border-b-2 border-red-500">
              CMS
            </Link>
            <Link href="/admin/audit" className="px-3 py-2 text-sm font-medium hover:bg-gray-700">
              Audit Log
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('homepage')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'homepage'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Homepage
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'faqs'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'terms'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'privacy'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Privacy Policy
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Homepage Tab */}
            {activeTab === 'homepage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hero Title
                      </label>
                      <input
                        type="text"
                        value={content.homepage.heroTitle}
                        onChange={(e) => updateHomepage('heroTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hero Subtitle
                      </label>
                      <input
                        type="text"
                        value={content.homepage.heroSubtitle}
                        onChange={(e) => updateHomepage('heroSubtitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Trust Badges Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={content.homepage.trustBadgesTitle}
                        onChange={(e) => updateHomepage('trustBadgesTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Description
                      </label>
                      <textarea
                        value={content.homepage.trustBadgesDescription}
                        onChange={(e) => updateHomepage('trustBadgesDescription', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={content.homepage.howItWorksTitle}
                        onChange={(e) => updateHomepage('howItWorksTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    {content.homepage.howItWorksSteps.map((step) => (
                      <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center mb-2">
                          <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium">Step {step.order}</span>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateHowItWorksStep(step.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Step title"
                          />
                          <textarea
                            value={step.description}
                            onChange={(e) => updateHowItWorksStep(step.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Step description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Call to Action</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CTA Title
                      </label>
                      <input
                        type="text"
                        value={content.homepage.ctaTitle}
                        onChange={(e) => updateHomepage('ctaTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CTA Description
                      </label>
                      <textarea
                        value={content.homepage.ctaDescription}
                        onChange={(e) => updateHomepage('ctaDescription', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={content.homepage.ctaButtonText}
                        onChange={(e) => updateHomepage('ctaButtonText', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Add New FAQ</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={newFAQ.question}
                        onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <textarea
                        placeholder="Answer"
                        value={newFAQ.answer}
                        onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={newFAQ.category}
                        onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="General">General</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Legal">Legal</option>
                        <option value="Features">Features</option>
                      </select>
                      <button onClick={addFAQ}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add FAQ
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {content.faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <button
                          onClick={() => deleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {editingFAQ === faq.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              setContent({
                                ...content,
                                faqs: content.faqs.map(f =>
                                  f.id === faq.id ? { ...f, question: e.target.value } : f
                                )
                              })
                              setUnsavedChanges(true)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={(e) => {
                              setContent({
                                ...content,
                                faqs: content.faqs.map(f =>
                                  f.id === faq.id ? { ...f, answer: e.target.value } : f
                                )
                              })
                              setUnsavedChanges(true)
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button onClick={() => setEditingFAQ(null)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Done
                          </button>
                        </div>
                      ) : (
                        <div onClick={() => setEditingFAQ(faq.id)} className="cursor-pointer">
                          <h4 className="font-medium mb-1">{faq.question}</h4>
                          <p className="text-gray-600 text-sm">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Tab */}
            {activeTab === 'terms' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Last updated: {content.terms.lastUpdated}
                  </p>
                </div>
                <textarea
                  value={content.terms.content}
                  onChange={(e) => {
                    setContent({
                      ...content,
                      terms: { ...content.terms, content: e.target.value }
                    })
                    setUnsavedChanges(true)
                  }}
                  rows={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                />
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Last updated: {content.privacy.lastUpdated}
                  </p>
                </div>
                <textarea
                  value={content.privacy.content}
                  onChange={(e) => {
                    setContent({
                      ...content,
                      privacy: { ...content.privacy, content: e.target.value }
                    })
                    setUnsavedChanges(true)
                  }}
                  rows={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}