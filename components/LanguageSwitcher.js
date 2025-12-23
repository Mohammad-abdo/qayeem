'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black-50 transition-colors"
      title={t('language.switch')}
      aria-label={t('language.switch')}
    >
      <Globe className="w-5 h-5 text-black-500" />
      <span className="text-sm font-medium text-black-500">
        {language === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  )
}













