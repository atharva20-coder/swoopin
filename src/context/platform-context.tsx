'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Platform = 'all' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp' | 'gmail'

type PlatformContextType = {
  activePlatform: Platform
  setActivePlatform: (platform: Platform) => void
  connectedPlatforms: Platform[]
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export const usePlatform = () => {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider')
  }
  return context
}

type PlatformProviderProps = {
  children: ReactNode
  connectedPlatforms?: Platform[]
}

export const PlatformProvider = ({ children, connectedPlatforms = ['instagram'] }: PlatformProviderProps) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('all')

  return (
    <PlatformContext.Provider value={{ activePlatform, setActivePlatform, connectedPlatforms }}>
      {children}
    </PlatformContext.Provider>
  )
}
