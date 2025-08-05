"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type CollapsibleState = {
  [key: string]: boolean
}

type CollapsibleContextType = {
  openItems: CollapsibleState
  toggleItem: (key: string) => void
  setItemOpen: (key: string, open: boolean) => void
  isItemOpen: (key: string) => boolean
  resetToAutoMode: () => void
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null)

export function useCollapsible() {
  const context = useContext(CollapsibleContext)
  if (!context) {
    throw new Error('useCollapsible must be used within CollapsibleProvider')
  }
  return context
}

export function CollapsibleProvider({ children }: { children: ReactNode }) {
  const [openItems, setOpenItems] = useState<CollapsibleState>({})
  const [manualMode, setManualMode] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Marca que estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carrega o estado inicial do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return
    
    const savedState = localStorage.getItem('sidebar_collapsible_state')
    if (savedState) {
      try {
        setOpenItems(JSON.parse(savedState))
      } catch (error) {
        console.error('Error parsing saved collapsible state:', error)
      }
    }
    
    const savedManualMode = localStorage.getItem('sidebar_manual_mode')
    if (savedManualMode) {
      setManualMode(savedManualMode === 'true')
    }
  }, [isClient])

  // Salva o estado no localStorage sempre que mudar (apenas no cliente)
  useEffect(() => {
    if (!isClient) return
    
    localStorage.setItem('sidebar_collapsible_state', JSON.stringify(openItems))
    localStorage.setItem('sidebar_manual_mode', manualMode.toString())
  }, [openItems, manualMode, isClient])

  // Sincroniza o estado com a rota atual - apenas no cliente
  useEffect(() => {
    if (!isClient || manualMode) return

    setOpenItems(prevState => {
      const newState = { ...prevState }
      
      // Lista de itens que podem ser collapsibles
      const collapsibleItems = ['Admin', 'Configuração', 'API - Em Breve']
      
      // Cria um mapa de rotas para cada item
      const routeMap: { [key: string]: string[] } = {
        'Admin': ['/admin', '/admin/geral', '/admin/configuracoes', '/conta'],
        'Configuração': ['/config', '/config/geral', '/config/perfil', '/config/cobranca', '/config/notificacoes'],
        'API - Em Breve': ['/api/crm', '/api/modelos']
      }
      
      // Para cada item, verifica se deve estar aberto baseado na rota atual
      collapsibleItems.forEach(item => {
        const routes = routeMap[item]
        const isCurrentRoute = routes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        )
        
        // Sincroniza com a rota atual - mantém aberto se estiver na rota correta
        if (isCurrentRoute) {
          newState[item] = true
        }
        // Se não estiver na rota, mantém o estado atual (não força fechar)
      })
      
      return newState
    })
  }, [pathname, manualMode, isClient])

  const toggleItem = (key: string) => {
    // Ativa modo manual apenas no cliente
    if (isClient) {
      setManualMode(true)
    }
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const setItemOpen = (key: string, open: boolean) => {
    // Ativa modo manual apenas no cliente
    if (isClient) {
      setManualMode(true)
    }
    setOpenItems(prev => ({
      ...prev,
      [key]: open
    }))
  }

  const isItemOpen = (key: string): boolean => {
    // Para SSR, retorna sempre falso para evitar hydration mismatch
    if (!isClient) {
      return false
    }
    return openItems[key] || false
  }

  const resetToAutoMode = () => {
    if (isClient) {
      setManualMode(false)
    }
  }

  return (
    <CollapsibleContext.Provider value={{ openItems, toggleItem, setItemOpen, isItemOpen, resetToAutoMode }}>
      {children}
    </CollapsibleContext.Provider>
  )
}