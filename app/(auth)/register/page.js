'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, Lock, Phone } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  useEffect(() => {
    if (user) {
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

    if (!agreeToTerms) {
      toast.error(language === 'ar' ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the Terms & Conditions')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        name: formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })

      if (result.success) {
        toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully')
        router.push('/')
      } else {
        toast.error(result.error || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Account creation failed'))
      }
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'An error occurred during account creation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Panel - Form (White Background) */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between px-8 lg:px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src="/images/logo.png" alt={language === 'ar' ? 'نظام قيم' : 'Qayeem System'} className=" object-contain" />
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className={`mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-4xl font-bold text-black-500 mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.register.title')}</h1>
            <p className={`text-base text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'انضم الآن وابدأ رحلتك نحو تطوير نفسك.' : 'Join now and start your journey towards self-development.'}
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
                placeholder={t('auth.register.email')}
                dir="ltr"
              />
            </div>

            {/* Phone Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-black-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
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
                minLength={6}
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                placeholder={t('auth.register.password')}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-primary-500 rounded focus:ring-primary-500 border-black-200"
              />
              <label htmlFor="terms" className="text-sm text-black-600">
                {language === 'ar' 
                  ? 'عند التسجيل، أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة'
                  : 'By registering, I agree to the Terms & Conditions and Privacy Policy'}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !agreeToTerms}
              className="w-full px-6 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('common.loading') : t('auth.register.title')}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-black-600">
              {t('auth.register.hasAccount')}{' '}
              <Link href="/login" className="font-bold text-primary-500 hover:text-primary-400">
                {t('auth.register.login')}
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-primary-400 to-primary-600 items-center justify-center px-12">
        <div className="text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            {language === 'ar' ? 'ابدأ رحلتك مع نظامُ قِيمٍ!' : 'Start Your Journey with Qayeem System!'}
          </h2>
        </div>
      </div>
    </div>
  )
}
