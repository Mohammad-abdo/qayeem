'use client'

import './globals.css'
import { Inter, Tajawal } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { Toaster } from 'react-hot-toast'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const tajawal = Tajawal({ subsets: ['arabic', 'latin'], weight: ['300', '400', '500', '700', '800', '900'], variable: '--font-tajawal' })

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState('ar')
  const [dir, setDir] = useState('rtl')

  useEffect(() => {
    setMounted(true)
    const savedLanguage = Cookies.get('language') || 'ar'
    setLang(savedLanguage)
    setDir(savedLanguage === 'ar' ? 'rtl' : 'ltr')
    
    // Update HTML attributes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  if (!mounted) {
    return (
      <html lang="ar" dir="rtl" suppressHydrationWarning>
        <head>
          <title>نظام قيم - Qayeem System</title>
          <meta name="description" content="Comprehensive evaluation and rating system" />
        </head>
        <body className={`${inter.variable} ${tajawal.variable} font-sans`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <title>{lang === 'ar' ? 'نظام قيم - Qayeem System' : 'Qayeem System - نظام قيم'}</title>
        <meta name="description" content="Comprehensive evaluation and rating system" />
      </head>
      <body className={`${inter.variable} ${tajawal.variable} font-sans`}>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <ThemeProvider>
              <AuthProvider>
                <AdminAuthProvider>
                  {children}
                  <Toaster position="top-center" />
                </AdminAuthProvider>
              </AuthProvider>
            </ThemeProvider>
          </LanguageProvider>
        </I18nextProvider>
      </body>
    </html>
  )
}
