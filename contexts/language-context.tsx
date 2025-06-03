"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "es" | "fr" | "de" | "it"

interface LanguageContextType {
  currentLanguage: Language
  setLanguage: (language: Language) => void
  languages: { code: Language; name: string; flag: string }[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  const languages = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "es" as Language, name: "Español", flag: "🇪🇸" },
    { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
    { code: "de" as Language, name: "Deutsch", flag: "🇩🇪" },
    { code: "it" as Language, name: "Italiano", flag: "🇮🇹" },
  ]

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language)
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
