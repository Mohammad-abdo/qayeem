'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(data.email)
      setIsSubmitted(true)
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    } catch (error) {
      toast.error(error.response?.data?.error || 'حدث خطأ. حاول مرة أخرى')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-black-600 hover:text-primary-500 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة لتسجيل الدخول
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-2xl shadow-lg mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black-500 mb-3">
              تم إرسال الرسالة
            </h1>
            <p className="text-lg text-black-600">
              تحقق من بريدك الإلكتروني
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-black-100 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-black-600 mb-6 leading-relaxed">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك واتباع التعليمات لإعادة تعيين كلمة المرور.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-primary-500 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-primary-400 transition-all"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-black-600 hover:text-primary-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة لتسجيل الدخول
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform">
            <img src="/images/logo.png" alt="نظام قيم" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-black-500 mb-3">
            نسيت كلمة المرور؟
          </h1>
          <p className="text-lg text-black-600">
            لا تقلق، سنساعدك
          </p>
          <p className="text-sm text-black-600 mt-2">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-black-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-black-500 mb-2"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-black-600" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 pr-12 border-2 border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500 transition-all"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="ml-1">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-3.5 rounded-lg font-bold text-lg shadow-lg hover:bg-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-1.657.448-3.15 1.177-4.47L2.05 5.536A9.96 9.96 0 000 12c0 5.523 4.477 10 10 10s10-4.477 10-10S15.523 2 10 2V0z"></path>
                  </svg>
                  جاري الإرسال...
                </span>
              ) : (
                'إرسال رابط إعادة التعيين'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors"
            >
              تذكرت كلمة المرور؟ تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


