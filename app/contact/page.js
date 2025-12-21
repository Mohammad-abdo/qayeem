'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { BookOpen, Send, MessageCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSending(true)
      // This would call a contact API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(t('contact.success'))
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        message: '',
      })
      // Show success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      toast.error(t('contact.error'))
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header currentPage="/contact" />
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20 lg:h-24"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
               {/* Illustration */}
          <div className="hidden lg:flex items-center justify-center animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            <div className="relative w-full h-full max-w-md hover-lift">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl"></div>
              <div className="relative p-12 text-center">
                <div className="mb-8 animate-float">
                  <MessageCircle className="w-24 h-24 text-primary-500 mx-auto mb-4" />
                  <Phone className="w-16 h-16 text-primary-400 mx-auto" />
                  <img src="/images/object.png" alt="contact" className="w-full fit-content object-cover" />
                </div>
                <p className={`text-black-600 text-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'نحن هنا لمساعدتك في أي استفسار أو سؤال' : 'We are here to help you with any inquiry or question'}
                </p>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-black-500 mb-4 sm:mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('contact.title')}</h1>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-black-100 hover-lift">
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:border-primary-300"
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:border-primary-300"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  dir="ltr"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('contact.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:border-primary-300"
                  placeholder={language === 'ar' ? 'أدخل رسالتك هنا...' : 'Enter your message here...'}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 hover-scale hover-glow animate-fade-in"
                style={{ animationDelay: '0.6s' }}
              >
                <Send className="w-5 h-5" />
                {sending ? t('common.loading') : t('contact.send')}
              </button>
            </form>
          </div>

       
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

