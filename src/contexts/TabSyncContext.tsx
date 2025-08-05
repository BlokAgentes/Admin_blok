"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export type TabState = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabSyncContext = createContext<TabState | null>(null)

export function useTabSync() {
  const context = useContext(TabSyncContext)
  if (!context) {
    throw new Error('useTabSync must be used within TabSyncProvider')
  }
  return context
}

export function TabSyncProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [activeTab, setActiveTabState] = useState<string>('')

  const setActiveTabFromPath = (path: string) => {
    // Map path to tab identifier
    let tab = ''
    if (path.startsWith('/admin')) {
      tab = 'admin'
    } else if (path.startsWith('/tabelas')) {
      tab = 'tabelas'
    } else if (path.startsWith('/conversas')) {
      tab = 'conversas'
    } else if (path.startsWith('/cobranca')) {
      tab = 'cobranca'
    } else if (path.startsWith('/config')) {
      tab = 'config'
    } else if (path.startsWith('/api/crm')) {
      tab = 'crm'
    } else if (path.startsWith('/api/modelos')) {
      tab = 'modelos'
    } else if (path.startsWith('/suporte')) {
      tab = 'suporte'
    } else if (path.startsWith('/feedback')) {
      tab = 'feedback'
    }
    
    if (tab && tab !== activeTab) {
      setActiveTabState(tab)
    }
  }

  // Load state from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('sidebar_active_tab')
    
    if (savedTab) {
      setActiveTabState(savedTab)
    } else if (pathname) {
      // Set initial tab based on current path
      setActiveTabFromPath(pathname)
    }
  }, [pathname])

  // Update active tab when pathname changes
  useEffect(() => {
    if (pathname) {
      setActiveTabFromPath(pathname)
    }
  }, [pathname])

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    localStorage.setItem('sidebar_active_tab', tab)
  }

  const value: TabState = {
    activeTab,
    setActiveTab,
  }

  return (
    <TabSyncContext.Provider value={value}>
      {children}
    </TabSyncContext.Provider>
  )
}