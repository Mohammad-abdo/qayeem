'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminRolesAPI, adminPermissionsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, Shield } from 'lucide-react'
import Link from 'next/link'

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissions, setPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    permissionIds: [],
  })

  useEffect(() => {
    if (admin && params.id) {
      fetchRole()
      fetchPermissions()
    }
  }, [admin, params.id])

  const fetchRole = async () => {
    try {
      setLoading(true)
      const response = await adminRolesAPI.getById(params.id)
      const role = response.data.role
      setFormData({
        name: role.name || '',
        nameAr: role.nameAr || '',
        description: role.description || '',
        descriptionAr: role.descriptionAr || '',
        permissionIds: role.permissions?.map((rp) => rp.permissionId) || [],
      })
    } catch (error) {
      toast.error('فشل تحميل بيانات الدور')
      router.push('/dashboard/roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true)
      const response = await adminPermissionsAPI.getAll()
      setPermissions(response.data.permissions || [])
    } catch (error) {
      toast.error('فشل تحميل الصلاحيات')
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await adminRolesAPI.update(params.id, formData)
      toast.success('تم تحديث الدور بنجاح')
      router.push('/dashboard/roles')
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تحديث الدور')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const togglePermission = (permissionId) => {
    setFormData({
      ...formData,
      permissionIds: formData.permissionIds.includes(permissionId)
        ? formData.permissionIds.filter(id => id !== permissionId)
        : [...formData.permissionIds, permissionId],
    })
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource || 'أخرى'
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              تعديل الدور
            </h1>
            <p className="text-primary-100 text-lg">
              تعديل معلومات الدور والصلاحيات
            </p>
          </div>
          <Link
            href="/dashboard/roles"
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
            />
          </div>
        </div>

        {/* Permissions Selection */}
        <div className="border-t border-black-100 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-black-500">
              الصلاحيات
            </h2>
          </div>

          {loadingPermissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="border border-black-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-black-500 mb-4">
                    {resource}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-3 p-3 border border-black-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <div>
                          <span className="font-medium text-black-500">
                            {permission.actionAr || permission.action}
                          </span>
                          {permission.nameAr && (
                            <p className="text-xs text-black-400">
                              {permission.nameAr}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-black-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <Link 
            href="/dashboard/roles" 
            className="px-6 py-3 bg-black-50 text-black-500 rounded-xl hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors font-semibold"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}












