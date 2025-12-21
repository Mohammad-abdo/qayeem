'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, logout } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (user) {
      // Prevent ADMIN from logging in through regular login
      if (user.role === 'ADMIN') {
        toast.error(language === 'ar' ? 'يجب تسجيل الدخول من صفحة الإدارة' : 'You must login from the admin page')
        logout()
        router.push('/admin/login')
        return
      }
      router.push('/')
    }
  }, [user, router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful')
        router.push('/')
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'))
      }
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Panel - Form (White Background) */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col justify-between px-8 lg:px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src="/images/logo.png" alt={language === 'ar' ? 'نظام قيم' : 'Qayeem System'} className="  object-contain" />
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className={`mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-4xl font-bold text-black-500 mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.login.title')}</h1>
            <p className={`text-base text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'أهلاً بك من جديد! تابع تقييماتك، واقرأ اقتراحاتك المخصصة.' : 'Welcome back! Continue your evaluations and read your personalized suggestions.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-black-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                placeholder={t('auth.login.email')}
                dir="ltr"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-black-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                placeholder={t('auth.login.password')}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 border-black-200"
              />
              <label htmlFor="remember" className="text-sm text-black-600">
                {t('auth.login.rememberMe')}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('common.loading') : t('auth.login.title')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-black-600">
              {t('auth.login.noAccount')}{' '}
              <Link href="/register" className="font-bold text-primary-500 hover:text-primary-400">
                {t('auth.login.register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-sm text-black-400 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>

      {/* Right Panel - Gradient Background */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-b from-primary-400 to-primary-600 items-center justify-center px-12">
        <div className="text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {language === 'ar' ? (
              <>
                مرحباً بك مجدداً
                <br />
                فِي نِظَامٍ قِيمٍ!
              </>
            ) : (
              <>
                Welcome Back
                <br />
                to Qayeem System!
              </>
            )}
          </h2>
        </div>
      </div>
    </div>
  )
}
