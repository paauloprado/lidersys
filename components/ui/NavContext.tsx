'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface NavContextType {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
  toggleMobile: () => void
  closeMobile: () => void
}

const NavContext = createContext<NavContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Fecha o menu lateral automaticamente ao navegar para uma nova rota
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Trata tecla ESC para fechar menu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileOpen])

  return (
    <NavContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        toggleMobile: () => setIsMobileOpen((prev) => !prev),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
