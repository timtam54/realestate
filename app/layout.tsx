import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import PWAInstall from "@/components/PWAInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuySel",
  description: "BuySel - Buy and Sell properties",
  manifest: "/manifest.json",
  themeColor: "#FF6600",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuySel",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* EMERGENCY SERVICE WORKER KILL SWITCH - Must load FIRST before anything else */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🔥 [Emergency SW Kill Switch] Running...');
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations()
                .then(function(registrations) {
                  console.log('🔥 [Emergency SW Kill Switch] Found ' + registrations.length + ' service worker(s)');
                  if (registrations.length > 0) {
                    var unregisterPromises = registrations.map(function(registration) {
                      console.log('🔥 [Emergency SW Kill Switch] Force unregistering:', registration.scope);
                      return registration.unregister();
                    });
                    return Promise.all(unregisterPromises).then(function() {
                      console.log('🔥 [Emergency SW Kill Switch] All service workers unregistered successfully');
                      var hasReloaded = sessionStorage.getItem('sw_kill_switch_reloaded');
                      if (!hasReloaded) {
                        console.log('🔥 [Emergency SW Kill Switch] Forcing hard reload...');
                        sessionStorage.setItem('sw_kill_switch_reloaded', 'true');
                        window.location.reload(true);
                      } else {
                        console.log('🔥 [Emergency SW Kill Switch] Already reloaded, not reloading again');
                        sessionStorage.removeItem('sw_kill_switch_reloaded');
                      }
                    });
                  } else {
                    console.log('🔥 [Emergency SW Kill Switch] No service workers found, nothing to unregister');
                  }
                })
                .catch(function(error) {
                  console.error('🔥 [Emergency SW Kill Switch] Error:', error);
                });
            } else {
              console.log('🔥 [Emergency SW Kill Switch] Service workers not supported');
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <PWAInstall />
        </Providers>
      </body>
    </html>
  );
}
