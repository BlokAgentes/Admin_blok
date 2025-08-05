"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type SidebarState = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SidebarStateContext = createContext<SidebarState | null>(null)

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (!context) {
    throw new Error('useSidebarState must be used within SidebarStateProvider')
  }
  return context
}

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpenState] = useState(true)

  // Carrega o estado inicial do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_state')
    if (savedState !== null) {
      setIsOpenState(savedState === 'true')
    }
  }, [])

  // Salva o estado no localStorage sempre que mudar
  const setIsOpen = (open: boolean) => {
    setIsOpenState(open)
    localStorage.setItem('sidebar_state', open.toString())
  }

  return (
    <SidebarStateContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarStateContext.Provider>
  )
}