'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminPermissionsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function PermissionsPage() {
  const { admin } = useAdminAuth()
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm } = useConfirm()

  useEffect(() => {
    if (admin) {
      fetchPermissions()
    }
  }, [admin])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await adminPermissionsAPI.getAll()
      setPermissions(response.data.permissions || [])
    } catch (error) {
      toast.error('فشل تحميل الصلاحيات')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذه الصلاحية؟', async () => {
      try {
        await adminPermissionsAPI.delete(id)
        toast.success('تم حذف الصلاحية بنجاح')
        fetchPermissions()
      } catch (error) {
        toast.error('فشل حذف الصلاحية')
      }
    })
  }

  if (loading) {
    return <LoadingSpinner />
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

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إدارة الصلاحيات"
        description="إدارة صلاحيات النظام والأدوار"
        gradient={false}
        actionButton={
          <Link
            href="/dashboard/permissions/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="ml-2 w-5 h-5" />
            إضافة صلاحية جديدة
          </Link>
        }
      />

      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        {permissions.length === 0 ? (
          <EmptyState
            icon={Key}
            title="لا توجد صلاحيات"
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="border-b border-black-100 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-bold text-black-500 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  {resource}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className="border border-black-100 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-black-500">
                            {permission.action}
                          </h4>
                          {permission.description && (
                            <p className="text-sm text-black-600 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          href={`/dashboard/permissions/${permission.id}/edit`}
                          className="flex-1 px-3 py-1.5 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 text-center text-sm"
                        >
                          <Edit className="w-4 h-4 inline ml-1" />
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}







