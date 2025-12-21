'use client'

import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useTranslation()
  const { language } = useLanguage()

  return (
    <footer className="bg-primary-500 text-white py-8 sm:py-10 lg:py-14 px-4 sm:px-6 lg:px-12 xl:px-20">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {/* Brand and Description Section */}
          <div className={`flex-1 flex flex-col gap-3 sm:gap-4 ${language === 'ar' ? 'items-start lg:items-start' : 'items-start lg:items-end'}`}>
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <img 
                src="/images/logo.png" 
                alt={language === 'ar' ? 'نظام قيم' : 'Qayeem System'} 
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-contain" 
              />
            </div>
            <p className={`text-sm sm:text-base text-white/90 ${language === 'ar' ? 'text-right' : 'text-left'} leading-relaxed max-w-full lg:max-w-[440px]`}>
              {t('footer.description')}
            </p>
            <div className="flex gap-3 sm:gap-4 mt-2">
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img src="/images/skill-icons_linkedin.png" alt="LinkedIn" className="w-4 h-4 sm:w-6 sm:h-6" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img src="/images/skill-icons_instagram.png" alt="Instagram" className="w-4 h-4 sm:w-6 sm:h-6" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <img src="/images/devicon_facebook.png" alt="Facebook" className="w-4 h-4 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Links Sections - Stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row lg:flex-1 gap-8 lg:gap-8">
            {/* Main Links Section */}
            <div className={`flex-1 flex flex-col gap-3 sm:gap-4 ${language === 'ar' ? 'items-start' : 'items-start'}`}>
              <h3 className={`text-xs sm:text-sm uppercase mb-2 sm:mb-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('footer.mainLinks')}</h3>
              <Link
                href="/"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.home')}
              </Link>
              <Link
                href="#"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.axes')}
              </Link>
              <Link
                href="/library"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.library')}
              </Link>
              <Link
                href="/contact"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.contact')}
              </Link>
            </div>

            {/* Support Links Section */}
            <div className={`flex-1 flex flex-col gap-3 sm:gap-4 ${language === 'ar' ? 'items-start' : 'items-start'}`}>
              <h3 className={`text-xs sm:text-sm uppercase mb-2 sm:mb-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('footer.supportLinks')}</h3>
              <Link
                href="#"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.terms')}
              </Link>
              <Link
                href="#"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href="/library"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.library')}
              </Link>
              <Link
                href="/contact"
                className={`text-sm sm:text-base text-white/90 hover:text-white transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {t('footer.contact')}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-4">
          <p className="text-xs sm:text-sm text-white/90 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

