"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface OpenAIModelContextType {
  selectedModel: string
  setSelectedModel: (model: string) => void
  availableModels: string[]
}

const OpenAIModelContext = createContext<OpenAIModelContextType | undefined>(undefined)

interface OpenAIModelProviderProps {
  children: ReactNode
}

export function OpenAIModelProvider({ children }: OpenAIModelProviderProps) {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4')
  
  const availableModels = [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-3.5-turbo'
  ]

  const handleModelChange = (model: string) => {
    console.log('🔄 OpenAI Model Context: Modelo alterado de', selectedModel, 'para', model)
    setSelectedModel(model)
  }

  console.log('📊 OpenAI Model Context: Estado atual -', { selectedModel, availableModels })

  return (
    <OpenAIModelContext.Provider value={{
      selectedModel,
      setSelectedModel: handleModelChange,
      availableModels
    }}>
      {children}
    </OpenAIModelContext.Provider>
  )
}

export function useOpenAIModel() {
  const context = useContext(OpenAIModelContext)
  if (context === undefined) {
    throw new Error('useOpenAIModel must be used within an OpenAIModelProvider')
  }
  return context
}