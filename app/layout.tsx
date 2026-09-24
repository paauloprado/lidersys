import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#015CFA',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'LiderSys',
  description: 'Sistema de gestão de hierarquia em campanhas eleitorais',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LiderSys',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
