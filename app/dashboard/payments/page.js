'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminPaymentsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { CreditCard, Check, X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function PaymentsPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (admin) {
      fetchPayments()
    }
  }, [admin, filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await adminPaymentsAPI.getAll({
        status: filter !== 'all' ? filter : undefined,
      })
      setPayments(response.data.payments || [])
    } catch (error) {
      toast.error('فشل تحميل المدفوعات')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminPaymentsAPI.updateStatus(id, status)
      toast.success('تم تحديث حالة الدفع بنجاح')
      fetchPayments()
    } catch (error) {
      toast.error('فشل تحديث حالة الدفع')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="w-5 h-5 text-green-500" />
      case 'FAILED':
        return <X className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-black-50 text-black-600',
    }
    return badges[status] || badges.PENDING
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <PageHeader
        title="المدفوعات"
        description="إدارة جميع المدفوعات"
        gradient={false}
      />

      {/* Filters */}
      {(
        <div className="flex gap-2">
          {['all', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-black-600 border border-black-100'
              }`}
            >
              {status === 'all' ? 'الكل' : status}
            </button>
          ))}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 overflow-x-auto">
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="لا توجد مدفوعات"
            compact={true}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black-100">
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  المعرف
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  المستخدم
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الكتاب
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  المبلغ
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  التاريخ
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-black-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-black-100 hover:bg-black-50"
                >
                  <td className="py-3 px-4 text-sm text-black-500">
                    #{payment.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-black-600">
                    {payment.user?.name || 'غير معروف'}
                  </td>
                  <td className="py-3 px-4 text-sm text-black-600">
                    {payment.book?.title || 'غير معروف'}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-black-500">
                    {parseFloat(payment.amount).toFixed(2)} ر.س
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        payment.status
                      )}`}
                    >
                      {getStatusIcon(payment.status)}
                      <span className="mr-1">
                        {payment.status === 'COMPLETED'
                          ? 'مكتمل'
                          : payment.status === 'PENDING'
                          ? 'قيد الانتظار'
                          : payment.status === 'FAILED'
                          ? 'فاشل'
                          : 'ملغي'}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-black-600">
                    {format(new Date(payment.createdAt), 'yyyy-MM-dd', {
                      locale: arSA,
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'FAILED')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          رفض
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-black-400">-</span>
                    )}
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
