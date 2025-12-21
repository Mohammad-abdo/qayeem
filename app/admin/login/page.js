'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { adminLogin, admin } = useAdminAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (admin && admin.role === 'ADMIN') {
      router.push('/dashboard')
    }
  }, [admin, router])

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
      const result = await adminLogin(formData.email, formData.password)
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح')
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'فشل تسجيل الدخول')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      {/* Left Panel - Form (White Background) */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col justify-between px-8 lg:px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src="/images/logo.png" alt="نظام قيم" className="w-12 h-12 object-contain" />
          <div>
            <span className="text-2xl font-bold text-black-500">لوحة تحكم الإدارة</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black-500 mb-3">تسجيل دخول الإدارة</h1>
            <p className="text-base text-black-600">
              هذه الصفحة مخصصة للمديرين فقط. يجب أن يكون لديك صلاحية ADMIN للوصول.
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
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black-500"
                placeholder="البريد الإلكتروني"
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
                className="w-full pl-4 pr-12 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-black-500"
                placeholder="كلمة المرور"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-black-200"
              />
              <label htmlFor="remember" className="text-sm text-black-600">
                تذكرني
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول الإدارة'}
            </button>
          </form>

          {/* Warning */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              ⚠️ هذه الصفحة مخصصة للمديرين فقط. المستخدمون العاديون لا يمكنهم الوصول إلى لوحة التحكم.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-sm text-black-400 text-center">
            جميع الحقوق محفوظة © نظام قيم 2025
          </p>
        </div>
      </div>

      {/* Right Panel - Gradient Background */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-b from-red-600 to-red-800 items-center justify-center px-12">
        <div className="text-center">
          <img src="/images/logo.png" alt="نظام قيم" className="w-32 h-32 object-contain mx-auto mb-6" />
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            لوحة تحكم
            <br />
            الإدارة
          </h2>
          <p className="text-xl text-white/90">
            إدارة النظام والتحكم الكامل
          </p>
        </div>
      </div>
    </div>
  )
}

