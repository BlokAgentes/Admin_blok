"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BlurContextType {
  isBlurred: boolean;
  setBlurred: (blurred: boolean) => void;
  toggleBlur: () => void;
}

const BlurContext = createContext<BlurContextType | undefined>(undefined);

export function BlurProvider({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false);

  const setBlurred = (blurred: boolean) => {
    setIsBlurred(blurred);
  };

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  return (
    <BlurContext.Provider value={{ isBlurred, setBlurred, toggleBlur }}>
      {children}
    </BlurContext.Provider>
  );
}

export function useBlur() {
  const context = useContext(BlurContext);
  if (context === undefined) {
    throw new Error('useBlur must be used within a BlurProvider');
  }
  return context;
} 