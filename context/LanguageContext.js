'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Cookies from 'js-cookie'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState('ar')

  useEffect(() => {
    // Load saved language from cookies
    const savedLanguage = Cookies.get('language') || 'ar'
    setLanguage(savedLanguage)
    i18n.changeLanguage(savedLanguage)
  }, [i18n])

  const changeLanguage = (lng) => {
    setLanguage(lng)
    i18n.changeLanguage(lng)
    Cookies.set('language', lng, { expires: 365 })
    
    // Update HTML lang and dir attributes
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lng
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    }
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}














