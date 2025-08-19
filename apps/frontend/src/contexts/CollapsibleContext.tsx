"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
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
  isManualMode: boolean // Expor o modo para componentes filhos
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null)

export function useCollapsible() {
  const context = useContext(CollapsibleContext)
  if (!context) {
    throw new Error('useCollapsible must be used within CollapsibleProvider')
  }
  return context
}

// Configuração externa para facilitar manutenção
const ROUTE_CONFIG = {
  'Admin': ['/admin', '/admin/geral', '/admin/configuracoes', '/conta'],
  'Configuração': ['/config', '/config/geral', '/config/perfil', '/config/cobranca', '/config/notificacoes'],
  'API - Em Breve': ['/api/crm', '/api/modelos']
} as const

type CollapsibleProviderProps = {
  children: ReactNode
  routeConfig?: typeof ROUTE_CONFIG // Permite configuração customizada
  defaultOpenItems?: CollapsibleState // Estado inicial customizável
}

export function CollapsibleProvider({ 
  children, 
  routeConfig = ROUTE_CONFIG,
  defaultOpenItems = {}
}: CollapsibleProviderProps) {
  const [openItems, setOpenItems] = useState<CollapsibleState>(defaultOpenItems)
  const [manualMode, setManualMode] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Lista de itens colapsáveis derivada da configuração
  const collapsibleItems = useMemo(() => Object.keys(routeConfig), [routeConfig])

  // Marca que estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carrega o estado inicial do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return
    
    try {
      const savedState = localStorage.getItem('sidebar_collapsible_state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        setOpenItems(parsed)
      }
    } catch (error) {
      console.warn('Failed to load collapsible state:', error)
      // Mantém o estado padrão se falhar
    }
    
    try {
      const savedManualMode = localStorage.getItem('sidebar_manual_mode')
      if (savedManualMode !== null) {
        setManualMode(savedManualMode === 'true')
      }
    } catch (error) {
      console.warn('Failed to load manual mode state:', error)
    }
  }, [isClient])

  // Salva o estado no localStorage sempre que mudar (com debounce)
  useEffect(() => {
    if (!isClient) return
    
    // Debounce para evitar muitas escritas
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('sidebar_collapsible_state', JSON.stringify(openItems))
        localStorage.setItem('sidebar_manual_mode', manualMode.toString())
      } catch (error) {
        console.warn('Failed to save collapsible state:', error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [openItems, manualMode, isClient])

  // Sincroniza o estado com a rota atual - apenas no cliente e modo automático
  useEffect(() => {
    if (!isClient || manualMode) return

    setOpenItems(prevState => {
      const newState = { ...prevState }
      let hasChanges = false
      
      // Para cada item, verifica se deve estar aberto baseado na rota atual
      collapsibleItems.forEach(item => {
        const routes = routeConfig[item as keyof typeof routeConfig]
        if (!routes) return
        
        const isCurrentRoute = routes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        )
        
        // Só atualiza se a rota atual corresponde e o estado está diferente
        if (isCurrentRoute && !prevState[item]) {
          newState[item] = true
          hasChanges = true
        }
        // Opção: fechar outros itens quando navegar (descomente se desejar)
        // else if (!isCurrentRoute && prevState[item]) {
        //   newState[item] = false
        //   hasChanges = true
        // }
      })
      
      // Só retorna novo estado se houve mudanças (evita re-renders)
      return hasChanges ? newState : prevState
    })
  }, [pathname, manualMode, isClient, collapsibleItems, routeConfig])

  // Funções memoizadas para melhor performance
  const toggleItem = useCallback((key: string) => {
    // Ativa modo manual apenas no cliente
    if (isClient) {
      setManualMode(true)
    }
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [isClient])

  const setItemOpen = useCallback((key: string, open: boolean) => {
    // Ativa modo manual apenas no cliente
    if (isClient) {
      setManualMode(true)
    }
    setOpenItems(prev => {
      // Evita atualização se o valor já é o mesmo
      if (prev[key] === open) return prev
      return {
        ...prev,
        [key]: open
      }
    })
  }, [isClient])

  const isItemOpen = useCallback((key: string): boolean => {
    // Para SSR, retorna sempre falso para evitar hydration mismatch
    if (!isClient) {
      return false
    }
    return openItems[key] || false
  }, [isClient, openItems])

  const resetToAutoMode = useCallback(() => {
    if (!isClient) return
    
    setManualMode(false)
    
    // Opcionalmente, re-sincroniza com a rota atual ao resetar
    const newState: CollapsibleState = {}
    collapsibleItems.forEach(item => {
      const routes = routeConfig[item as keyof typeof routeConfig]
      if (!routes) return
      
      const isCurrentRoute = routes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      )
      
      if (isCurrentRoute) {
        newState[item] = true
      }
    })
    setOpenItems(newState)
  }, [isClient, pathname, collapsibleItems, routeConfig])

  // Valor memoizado do contexto
  const contextValue = useMemo(() => ({
    openItems,
    toggleItem,
    setItemOpen,
    isItemOpen,
    resetToAutoMode,
    isManualMode: manualMode
  }), [openItems, toggleItem, setItemOpen, isItemOpen, resetToAutoMode, manualMode])

  return (
    <CollapsibleContext.Provider value={contextValue}>
      {children}
    </CollapsibleContext.Provider>
  )
}