'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminActivityLogsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { FileText, Search, Filter, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function ActivityLogsPage() {
  const { admin } = useAdminAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 })
  const [filters, setFilters] = useState({
    userId: '',
    entity: '',
    entityId: '',
  })

  useEffect(() => {
    if (admin) {
      fetchLogs()
    }
  }, [admin, filters, pagination.page])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(filters.entity ? { entity: filters.entity } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
      }
      const response = await adminActivityLogsAPI.getAll(params)
      setLogs(response.data.logs || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      toast.error('فشل تحميل سجلات النشاط')
    } finally {
      setLoading(false)
    }
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
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              سجلات النشاط
            </h1>
            <p className="text-primary-100 text-lg">
              تتبع جميع الأنشطة في النظام
            </p>
          </div>
          <FileText className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              معرف المستخدم
            </label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
              placeholder="User ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الكيان
            </label>
            <input
              type="text"
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
              placeholder="Entity (e.g., Book, User)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              معرف الكيان
            </label>
            <input
              type="number"
              value={filters.entityId}
              onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
              placeholder="Entity ID"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 overflow-x-auto">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600">لا توجد سجلات نشاط</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-black-100">
                  <th className="text-right py-3 px-4 text-sm font-medium text-black-500">المستخدم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الإجراء</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الكيان</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-black-500">IP</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-black-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-black-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-black-600">
                      {log.user?.name || 'غير معروف'}
                    </td>
                    <td className="py-3 px-4 text-sm text-black-500">
                      {log.actionAr || log.action}
                    </td>
                    <td className="py-3 px-4 text-sm text-black-600">
                      {log.entity && log.entityId ? `${log.entity} #${log.entityId}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-black-600">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-black-600">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm', { locale: arSA })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-black-600">
                  صفحة {pagination.page} من {pagination.totalPages} ({pagination.total} إجمالي)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}






