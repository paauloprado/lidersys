'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Dispara a barra de progresso imediatamente ao clicar em links internos do dashboard
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || target.target === '_blank') return

      // Não inicia se já estiver na página atual
      const currentUrl = window.location.pathname + window.location.search
      if (href === currentUrl || href === pathname) return

      if (href.startsWith('/dashboard')) {
        setIsNavigating(true)
        setProgress(30)
        const t1 = setTimeout(() => setProgress(65), 120)
        const t2 = setTimeout(() => setProgress(85), 350)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [pathname])

  // Quando o pathname ou searchParams mudarem, a rota foi carregada com sucesso
  useEffect(() => {
    if (!isNavigating) return

    setProgress(100)
    const timer = setTimeout(() => {
      setIsNavigating(false)
      setProgress(0)
    }, 250)
    return () => clearTimeout(timer)
  }, [pathname, searchParams, isNavigating])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-primary via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(1,92,250,0.7)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionDuration: progress === 100 ? '200ms' : '300ms',
        }}
      />
    </div>
  )
}
