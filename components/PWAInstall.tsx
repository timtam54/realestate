'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // DISABLED: Service worker functionality is completely disabled
    // Service workers were causing infinite reload loops and OAuth issues
    console.log('✅ [PWAInstall] Service worker functionality is disabled')

    if ('serviceWorker' in navigator) {
      // Only unregister existing service workers, don't register new ones
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        if (registrations.length > 0) {
          console.log('🧹 [PWAInstall] Unregistering ' + registrations.length + ' existing service worker(s)')
          registrations.forEach(function(registration) {
            registration.unregister().then(function() {
              console.log('🧹 [PWAInstall] Unregistered service worker:', registration.scope)
            })
          })
        } else {
          console.log('✅ [PWAInstall] No service workers to clean up')
        }
      })
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && window.navigator.standalone === true)
    
    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => setShowInstallBanner(true), 3000)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!localStorage.getItem('pwa-install-dismissed')) {
        setTimeout(() => setShowInstallBanner(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showInstallBanner || isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Download className="w-6 h-6 text-orange-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Install BuySel</h3>
          {isIOS ? (
            <div className="text-sm text-gray-600 space-y-2">
              <p>Install this app on your iPhone:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Tap the share button <span className="inline-block w-4 h-4 align-middle">⬆️</span></li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot;</li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Get quick access to BuySel right from your home screen
              </p>
              <button
                onClick={handleInstallClick}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}