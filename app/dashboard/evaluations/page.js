'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminEvaluationsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, FileText, Archive, Copy, CheckCircle } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import SearchInput from '@/components/dashboard/SearchInput'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function EvaluationsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && admin) {
      fetchEvaluations()
    }
  }, [admin, authLoading, searchTerm])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await adminEvaluationsAPI.getAll({ search: searchTerm })
      setEvaluations(response.data.evaluations || [])
    } catch (error) {
      console.error('Error fetching evaluations:', error)
      toast.error('فشل تحميل التقييمات')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا التقييم؟', async () => {
      try {
        await adminEvaluationsAPI.delete(id)
        toast.success('تم حذف التقييم بنجاح')
        fetchEvaluations()
      } catch (error) {
        console.error('Error deleting evaluation:', error)
        toast.error('فشل حذف التقييم')
      }
    })
  }

  const handleArchive = async (id) => {
    try {
      await adminEvaluationsAPI.archive(id)
      toast.success('تم أرشفة التقييم بنجاح')
      fetchEvaluations()
    } catch (error) {
      console.error('Error archiving evaluation:', error)
      toast.error('فشل أرشفة التقييم')
    }
  }

  const handleClone = async (id) => {
    try {
      await adminEvaluationsAPI.clone(id)
      toast.success('تم نسخ التقييم بنجاح')
      fetchEvaluations()
    } catch (error) {
      console.error('Error cloning evaluation:', error)
      toast.error('فشل نسخ التقييم')
    }
  }

  const handleActivate = async (id) => {
    try {
      await adminEvaluationsAPI.activate(id)
      toast.success('تم تفعيل التقييم بنجاح')
      fetchEvaluations()
    } catch (error) {
      console.error('Error activating evaluation:', error)
      toast.error('فشل تفعيل التقييم')
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <PageHeader
        title="التقييمات"
        description="إدارة وتنظيم التقييمات"
        gradient={false}
        actionButton={
          <Link
            href="/dashboard/evaluations/new"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Plus className="ml-2 w-5 h-5" />
            إضافة تقييم جديد
          </Link>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchEvaluations()}
          placeholder="ابحث عن تقييم..."
        />
      </div>

      {/* Evaluations List */}
      {evaluations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا توجد تقييمات متاحة"
        />
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="bg-white rounded-lg shadow-md p-6 border border-black-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-black-500">
                      {evaluation.title}
                    </h3>
                    {evaluation.status === 'ACTIVE' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        نشط
                      </span>
                    )}
                    {evaluation.status === 'ARCHIVED' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black-50 text-black-600">
                        <Archive className="w-3 h-3 ml-1" />
                        مؤرشف
                      </span>
                    )}
                    {evaluation.status === 'DRAFT' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        مسودة
                      </span>
                    )}
                  </div>
                  {evaluation.titleAr && (
                    <p className="text-black-600 mb-2">
                      {evaluation.titleAr}
                    </p>
                  )}
                  {evaluation.description && (
                    <p className="text-sm text-black-600 mb-3 line-clamp-2">
                      {evaluation.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-black-600">
                    <span>
                      تاريخ الإنشاء:{' '}
                      {format(new Date(evaluation.createdAt), 'yyyy-MM-dd', {
                        locale: arSA,
                      })}
                    </span>
                    {evaluation.criteria && (
                      <span>
                        {evaluation.criteria.length} معيار
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {evaluation.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleActivate(evaluation.id)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                      title="تفعيل"
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      تفعيل
                    </button>
                  )}
                  <Link
                    href={`/dashboard/evaluations/${evaluation.id}`}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400"
                  >
                    عرض
                  </Link>
                  <button
                    onClick={() => handleClone(evaluation.id)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    title="نسخ"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {evaluation.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleArchive(evaluation.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      title="أرشفة"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    href={`/dashboard/evaluations/${evaluation.id}/edit`}
                    className="p-2 bg-black-600 text-white rounded-lg hover:bg-black-700"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(evaluation.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
