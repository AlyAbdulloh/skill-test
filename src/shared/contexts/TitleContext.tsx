'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface TitleState {
  title: string
  subtitle: string
}

interface TitleContextType extends TitleState {
  setTitle: (title: string, subtitle?: string) => void
}

const TitleContext = createContext<TitleContextType>({
  title: 'Dashboard',
  subtitle: '',
  setTitle: () => {},
})

export function TitleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TitleState>({ title: 'Dashboard', subtitle: '' })

  const setTitle = useCallback((title: string, subtitle = '') => {
    setState({ title, subtitle })
  }, [])

  return (
    <TitleContext.Provider value={{ ...state, setTitle }}>
      {children}
    </TitleContext.Provider>
  )
}

export function useTitle() {
  const context = useContext(TitleContext)
  if (!context) throw new Error('useTitle must be used within TitleProvider')
  return context
}
