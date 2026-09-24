import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LiderSys',
  description: 'Sistema de gestão de hierarquia em campanhas eleitorais',
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
