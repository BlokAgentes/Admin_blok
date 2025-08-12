"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

type SidebarState = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleSidebar: () => void // Adiciona função de toggle para conveniência
}

const SidebarStateContext = createContext<SidebarState | null>(null)

export function useSidebarState() {
  const context = useContext(SidebarStateContext)
  if (!context) {
    throw new Error('useSidebarState must be used within SidebarStateProvider')
  }
  return context
}

// Valor padrão inicial (pode ser configurável via props)
const DEFAULT_SIDEBAR_STATE = true

export function SidebarStateProvider({ 
  children,
  defaultOpen = DEFAULT_SIDEBAR_STATE 
}: { 
  children: ReactNode
  defaultOpen?: boolean 
}) {
  // Usa o defaultOpen como estado inicial para SSR
  const [isOpen, setIsOpenState] = useState(defaultOpen)
  const [isClient, setIsClient] = useState(false)

  // Marca que estamos no cliente (evita problemas de hidratação)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carrega o estado inicial do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return

    try {
      const savedState = localStorage.getItem('sidebar_state')
      if (savedState !== null) {
        setIsOpenState(savedState === 'true')
      }
    } catch (error) {
      // Falha silenciosamente se localStorage não estiver disponível
      console.warn('Failed to load sidebar state from localStorage:', error)
    }
  }, [isClient])

  // Salva o estado no localStorage sempre que mudar (com memoização)
  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open)
    
    // Só tenta salvar no localStorage se estivermos no cliente
    if (isClient) {
      try {
        localStorage.setItem('sidebar_state', open.toString())
      } catch (error) {
        // Falha silenciosamente se localStorage não estiver disponível
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }, [isClient])

  // Função de toggle para conveniência
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  return (
    <SidebarStateContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </SidebarStateContext.Provider>
  )
}