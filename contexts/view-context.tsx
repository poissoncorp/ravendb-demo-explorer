"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ViewType = "products" | "helpdesk" | "shopping-agent"

interface ViewContextType {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>("products")

  return <ViewContext.Provider value={{ currentView, setCurrentView }}>{children}</ViewContext.Provider>
}

export function useView() {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider")
  }
  return context
}
