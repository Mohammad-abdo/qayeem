'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminRolesAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Shield, Plus, Edit, Trash2 } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function RolesPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    } else if (admin) {
      fetchRoles()
    }
  }, [admin, authLoading, router])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await adminRolesAPI.getAll()
      setRoles(response.data.roles || [])
    } catch (error) {
      toast.error('فشل تحميل الأدوار')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا الدور؟', async () => {
      try {
        await adminRolesAPI.delete(id)
        toast.success('تم حذف الدور بنجاح')
        fetchRoles()
      } catch (error) {
        toast.error(error.response?.data?.error || 'فشل حذف الدور')
      }
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إدارة الأدوار"
        description="إدارة أدوار المستخدمين والصلاحيات"
        gradient={false}
        actionButton={
          <Link
            href="/dashboard/roles/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="ml-2 w-5 h-5" />
            إضافة دور جديد
          </Link>
        }
      />

      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        {roles.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="لا توجد أدوار"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border border-black-100 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black-500">
                      {role.name}
                    </h3>
                    {role.nameAr && (
                      <p className="text-black-600 text-sm">
                        {role.nameAr}
                      </p>
                    )}
                  </div>
                  {role.isSystem && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      نظام
                    </span>
                  )}
                </div>
                {role.description && (
                  <p className="text-sm text-black-600 mb-4">
                    {role.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/roles/${role.id}/edit`}
                    className="flex-1 px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors text-center py-2 text-sm"
                  >
                    <Edit className="w-4 h-4 inline ml-1" />
                    تعديل
                  </Link>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


