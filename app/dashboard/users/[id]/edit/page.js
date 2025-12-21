'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    role: 'USER',
    isActive: true,
  })

  useEffect(() => {
    if (admin && params.id) {
      fetchUser()
    }
  }, [admin, params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await adminUsersAPI.getById(params.id)
      const user = response.data.user
      setFormData({
        name: user.name || '',
        nameAr: user.nameAr || '',
        email: user.email || '',
        role: user.role || 'USER',
        isActive: user.isActive !== undefined ? user.isActive : true,
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('فشل تحميل بيانات المستخدم')
      router.push('/dashboard/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      await adminUsersAPI.update(params.id, formData)
      toast.success('تم تحديث المستخدم بنجاح')
      router.push('/dashboard/users')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error.response?.data?.error || 'فشل تحديث المستخدم')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            تعديل المستخدم
          </h1>
          <p className="mt-2 text-black-600">
            تعديل معلومات المستخدم
          </p>
        </div>
        <Link
          href="/dashboard/users"
          className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors flex items-center"
        >
          <ArrowRight className="ml-2 w-5 h-5" />
          رجوع
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-black-100 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الاسم (إنجليزي) *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              name="nameAr"
              value={formData.nameAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الدور *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            >
              <option value="USER">مستخدم</option>
              <option value="ADMIN">مدير</option>
              <option value="EVALUATOR">مقيّم</option>
              <option value="MANAGER">مدير</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <label className="mr-2 text-sm font-medium text-black-500">
              الحساب نشط
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Save className="ml-2 w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <Link href="/dashboard/users" className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}


