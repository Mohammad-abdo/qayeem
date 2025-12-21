'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminPermissionsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, Key } from 'lucide-react'
import Link from 'next/link'

export default function NewPermissionPage() {
  const router = useRouter()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    resource: '',
    resourceAr: '',
    action: '',
    actionAr: '',
    description: '',
    descriptionAr: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      await adminPermissionsAPI.create(formData)
      toast.success('تم إضافة الصلاحية بنجاح')
      router.push('/dashboard/permissions')
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل إضافة الصلاحية')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              إضافة صلاحية جديدة
            </h1>
            <p className="text-primary-100 text-lg">
              أضف صلاحية جديدة إلى النظام
            </p>
          </div>
          <Link
            href="/dashboard/permissions"
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            رجوع
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-black-100 space-y-8">
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
              placeholder="Permission Name"
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
              placeholder="اسم الصلاحية"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              المورد (Resource) *
            </label>
            <input
              type="text"
              name="resource"
              value={formData.resource}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="e.g., books, evaluations"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              المورد (عربي)
            </label>
            <input
              type="text"
              name="resourceAr"
              value={formData.resourceAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="مثل: كتب، تقييمات"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              العمل (Action) *
            </label>
            <select
              name="action"
              value={formData.action}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            >
              <option value="">اختر العمل</option>
              <option value="create">إنشاء (Create)</option>
              <option value="read">قراءة (Read)</option>
              <option value="update">تحديث (Update)</option>
              <option value="delete">حذف (Delete)</option>
              <option value="manage">إدارة (Manage)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              العمل (عربي)
            </label>
            <input
              type="text"
              name="actionAr"
              value={formData.actionAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="مثل: إنشاء، قراءة"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black-500 mb-2">
              الوصف (إنجليزي)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="Permission Description"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black-500 mb-2">
              الوصف (عربي)
            </label>
            <textarea
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="وصف الصلاحية"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-black-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ الصلاحية'}
          </button>
          <Link 
            href="/dashboard/permissions" 
            className="px-6 py-3 bg-black-50 text-black-500 rounded-xl hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors font-semibold"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}












