'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Save, User, Lock } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    nameAr: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    } else if (admin) {
      setProfileData({
        name: admin.name || '',
        nameAr: admin.nameAr || '',
        email: admin.email || '',
      })
    }
  }, [admin, authLoading, router])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await adminUsersAPI.update(admin.id, profileData)
      toast.success('تم تحديث الملف الشخصي بنجاح')
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تحديث الملف الشخصي')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    try {
      setLoading(true)
      await adminUsersAPI.update(admin.id, {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-black-500">
          الإعدادات
        </h1>
        <p className="mt-2 text-black-600">
          إدارة إعدادات حسابك
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <div className="flex items-center mb-6">
          <User className="w-5 h-5 ml-2 text-primary-500" />
          <h2 className="text-xl font-bold text-black-500">
            الملف الشخصي
          </h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                الاسم (إنجليزي) *
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                الاسم (عربي)
              </label>
              <input
                type="text"
                value={profileData.nameAr}
                onChange={(e) =>
                  setProfileData({ ...profileData, nameAr: e.target.value })
                }
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Save className="ml-2 w-5 h-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <div className="flex items-center mb-6">
          <Lock className="w-5 h-5 ml-2 text-primary-500" />
          <h2 className="text-xl font-bold text-black-500">
            تغيير كلمة المرور
          </h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              كلمة المرور الحالية *
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={6}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                تأكيد كلمة المرور *
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={6}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Lock className="ml-2 w-5 h-5" />
            {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  )
}

