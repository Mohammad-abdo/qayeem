'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Users, Edit, Trash2, Eye } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import Link from 'next/link'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import SearchInput from '@/components/dashboard/SearchInput'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function UsersPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && admin) {
      fetchUsers()
    }
  }, [admin, authLoading, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminUsersAPI.getAll({ search: searchTerm })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('فشل تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا المستخدم؟', async () => {
      try {
        await adminUsersAPI.delete(id)
        toast.success('تم حذف المستخدم بنجاح')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('فشل حذف المستخدم')
      }
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <PageHeader
        title="إدارة المستخدمين"
        description="إدارة وتنظيم المستخدمين"
        gradient={false}
      />

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
          placeholder="ابحث عن مستخدم..."
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 overflow-x-auto">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا يوجد مستخدمون"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black-100">
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الاسم
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  البريد الإلكتروني
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الدور
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  تاريخ التسجيل
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-black-100 hover:bg-black-50"
                >
                  <td className="py-3 px-4 text-sm text-black-500">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-black-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-primary-50 text-primary-500'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-black-600">
                    {format(new Date(user.createdAt), 'yyyy-MM-dd', {
                      locale: arSA,
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/users/${user.id}/edit`}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {user.id !== admin?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
