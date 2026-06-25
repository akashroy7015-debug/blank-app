'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Lang = 'en' | 'hi' | 'es' | 'fr' | 'pt' | 'ar' | 'de' | 'zh' | 'ja' | 'ko'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',      flag: '🇮🇳' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ar', label: 'عربي',       flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
]

const VALID_CODES = new Set<string>(LANGS.map(l => l.code))

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('flirtiq_lang')
    if (stored && VALID_CODES.has(stored)) {
      setLangState(stored as Lang)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('flirtiq_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
