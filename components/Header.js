'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import { Menu, X, Bell } from 'lucide-react'
import { notificationsAPI } from '@/lib/api'

export default function Header({ currentPage = '' }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notificationsRef = useRef(null)

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/evaluation', label: t('nav.evaluation') },
    { href: '/suggestions', label: t('nav.suggestions') },
    { href: '/library', label: t('nav.library') },
    { href: '/achievement', label: t('nav.achievement') },
    { href: '/contact', label: t('nav.contact') },
  ]

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const fetchNotifications = async () => {
      try {
        console.log('📬 [HEADER] Fetching notifications for user:', user.id)
        const response = await notificationsAPI.getAll()
        console.log('📬 [HEADER] Notifications response:', response.data)
        
        const allNotifications = response.data?.notifications || response.data || []
        const unreadNotifications = Array.isArray(allNotifications)
          ? allNotifications.filter((n) => !n.isRead)
          : []
        
        setNotifications(unreadNotifications.slice(0, 5)) // Show latest 5 unread
        setUnreadCount(unreadNotifications.length)
        console.log('📬 [HEADER] Unread notifications:', unreadNotifications.length)
      } catch (error) {
        console.error('❌ [HEADER] Failed to fetch notifications:', error)
        setNotifications([])
        setUnreadCount(0)
      }
    }

    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black-100 h-16 sm:h-20 lg:h-24 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-20 py-3 sm:py-4" 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link href="/" className="hover-scale transition-transform duration-300">
            <img 
              src="/images/logo.png" 
              alt={language === 'ar' ? 'نظام قيم' : 'Qayeem System'} 
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Desktop Menu - Center */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm xl:text-base transition-all duration-300 relative group whitespace-nowrap ${
                currentPage === link.href || (currentPage === '' && link.href === '/')
                  ? 'text-primary-500 font-bold'
                  : 'text-black-700 hover:text-primary-500'
              }`}
            >
              {link.label}
              <span className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} -bottom-1 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${
                currentPage === link.href || (currentPage === '' && link.href === '/') ? 'w-full' : ''
              }`}></span>
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <LanguageSwitcher />
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-black-500 hover:text-primary-500 transition-all duration-300 hover-scale group"
                  title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
                >
                  <Bell className="w-5 h-5 group-hover:animate-bounce" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-red-500 rounded-full animate-ping opacity-75"></span>
                    </>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {notificationsOpen && (
                  <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-black-100 z-50 max-h-96 overflow-hidden flex flex-col`}>
                    <div className="p-4 border-b border-black-100 flex items-center justify-between">
                      <h3 className="font-bold text-black-500">
                        {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-primary-500 text-white rounded-full text-xs font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-black-600">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-black-300" />
                          <p className="text-sm">
                            {language === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-black-100">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href="/profile"
                              onClick={() => setNotificationsOpen(false)}
                              className="block p-4 hover:bg-primary-50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-black-500 mb-1 line-clamp-1">
                                    {language === 'ar' && notification.titleAr ? notification.titleAr : notification.title}
                                  </h4>
                                  <p className="text-sm text-black-600 line-clamp-2 mb-1">
                                    {language === 'ar' && notification.messageAr ? notification.messageAr : notification.message}
                                  </p>
                                  <p className="text-xs text-black-400">
                                    {new Date(notification.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-black-100">
                        <Link
                          href="/profile"
                          onClick={() => setNotificationsOpen(false)}
                          className="block text-center text-primary-500 hover:text-primary-400 text-sm font-semibold"
                        >
                          {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 text-black-500 hover:text-primary-500 transition-all duration-300 hover-scale group"
              >
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-all duration-300">
                  <span className="text-primary-500 font-bold text-sm xl:text-base">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm xl:text-base hidden xl:inline">{t('nav.profile')}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="px-3 xl:px-4 py-1.5 xl:py-2 bg-primary-500 text-white rounded text-xs xl:text-sm font-bold hover:bg-primary-400 transition-all duration-300 hover-scale hover-glow whitespace-nowrap"
              >
                {t('nav.register')}
              </Link>
              <Link
                href="/login"
                className="px-3 xl:px-4 py-1.5 xl:py-2 border border-black-100 rounded text-xs xl:text-sm font-bold text-black-500 hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 hover-scale whitespace-nowrap"
              >
                {t('nav.login')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions + Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageSwitcher />
          {user && (
            <>
              {/* Mobile Notifications */}
              <Link
                href="/profile"
                className="relative p-2 text-black-500 hover:text-primary-500 transition-all duration-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </Link>
              <Link
                href="/profile"
                className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-all duration-300"
              >
                <span className="text-primary-500 font-bold text-sm">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black-700 hover:text-primary-500 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black-950 bg-opacity-50 z-40 lg:hidden top-16 sm:top-20"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className={`fixed top-16 sm:top-20 left-0 right-0 z-40 bg-white border-b border-black-100 shadow-lg lg:hidden ${
              language === 'ar' ? 'rtl' : 'ltr'
            }`}
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Menu Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 rounded-lg  font-bold  transition-all duration-300 ${
                    currentPage === link.href || (currentPage === '' && link.href === '/')
                      ? 'text-primary-500 font-bold bg-primary-50'
                      : 'text-black-700 hover:text-primary-500 hover:bg-primary-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="flex flex-col gap-2 pt-2 border-t border-black-100">
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded text-sm font-bold text-center hover:bg-primary-400 transition-all duration-300"
                  >
                    {t('nav.register')}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-2 border border-black-100 rounded text-sm font-bold text-black-500 text-center hover:bg-primary-50 hover:border-primary-300 transition-all duration-300"
                  >
                    {t('nav.login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
