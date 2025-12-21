'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminEvaluationsAPI, adminCriteriaAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Edit, FileText, Plus, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function EvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [evaluation, setEvaluation] = useState(null)
  const [criteria, setCriteria] = useState([])

  useEffect(() => {
    if (params.id && admin) {
      fetchEvaluation()
      fetchCriteria()
    }
  }, [params.id, admin])

  const fetchEvaluation = async () => {
    try {
      setLoading(true)
      const response = await adminEvaluationsAPI.getById(params.id)
      setEvaluation(response.data.evaluation)
    } catch (error) {
      console.error('Error fetching evaluation:', error)
      toast.error('فشل تحميل بيانات التقييم')
      router.push('/dashboard/evaluations')
    } finally {
      setLoading(false)
    }
  }

  const fetchCriteria = async () => {
    try {
      const response = await adminCriteriaAPI.getByEvaluation(params.id)
      setCriteria(response.data.criteria || [])
    } catch (error) {
      console.error('Error fetching criteria:', error)
    }
  }

  const handleActivate = async () => {
    try {
      await adminEvaluationsAPI.activate(params.id)
      toast.success('تم تفعيل التقييم بنجاح')
      fetchEvaluation()
    } catch (error) {
      console.error('Error activating evaluation:', error)
      toast.error('فشل تفعيل التقييم')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!evaluation) {
    return null
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            {evaluation.title}
          </h1>
          {evaluation.titleAr && (
            <p className="mt-2 text-xl text-black-600">
              {evaluation.titleAr}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {evaluation.status !== 'ACTIVE' && (
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <CheckCircle className="ml-2 w-5 h-5" />
              تفعيل
            </button>
          )}
          <Link
            href={`/dashboard/evaluations/${evaluation.id}/edit`}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Edit className="ml-2 w-5 h-5" />
            تعديل
          </Link>
          <Link
            href="/dashboard/evaluations"
            className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors flex items-center"
          >
            <ArrowRight className="ml-2 w-5 h-5" />
            رجوع
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <h2 className="text-xl font-bold text-black-500 mb-4">
              الوصف
            </h2>
            {evaluation.description && (
              <p className="text-black-600 mb-4 whitespace-pre-line">
                {evaluation.description}
              </p>
            )}
            {evaluation.descriptionAr && (
              <p className="text-black-600 whitespace-pre-line">
                {evaluation.descriptionAr}
              </p>
            )}
            {!evaluation.description && !evaluation.descriptionAr && (
              <p className="text-black-600">
                لا يوجد وصف متاح
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black-500">
                المعايير
              </h2>
              <Link
                href={`/dashboard/evaluations/${evaluation.id}/criteria/new`}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
              >
                <Plus className="ml-2 w-4 h-4" />
                إضافة معيار
              </Link>
            </div>
            {criteria.length === 0 ? (
              <p className="text-black-600 text-center py-8">
                لا توجد معايير متاحة
              </p>
            ) : (
              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="border border-black-100 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-black-500 mb-2">
                          {criterion.title}
                        </h3>
                        {criterion.titleAr && (
                          <p className="text-black-600 mb-2">
                            {criterion.titleAr}
                          </p>
                        )}
                        {criterion.description && (
                          <p className="text-sm text-black-600 mb-2">
                            {criterion.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-black-600">
                          <span>الوزن: {criterion.weight}</span>
                          <span>الحد الأقصى: {criterion.maxScore}</span>
                          {criterion.isRequired && (
                            <span className="text-red-500">مطلوب</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <h3 className="text-lg font-bold text-black-500 mb-4">
              معلومات التقييم
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-black-600">
                  النوع
                </p>
                <p className="text-black-500 font-medium">
                  {evaluation.type}
                </p>
              </div>

              <div>
                <p className="text-sm text-black-600">
                  الحالة
                </p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    evaluation.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800 '
                      : evaluation.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800 '
                      : 'bg-black-50 text-black-600'
                  }`}
                >
                  {evaluation.status === 'ACTIVE'
                    ? 'نشط'
                    : evaluation.status === 'COMPLETED'
                    ? 'مكتمل'
                    : 'مسودة'}
                </span>
              </div>

              {evaluation.startDate && (
                <div>
                  <p className="text-sm text-black-600">
                    تاريخ البدء
                  </p>
                  <p className="text-black-500 font-medium">
                    {format(new Date(evaluation.startDate), 'yyyy-MM-dd', {
                      locale: arSA,
                    })}
                  </p>
                </div>
              )}

              {evaluation.endDate && (
                <div>
                  <p className="text-sm text-black-600">
                    تاريخ الانتهاء
                  </p>
                  <p className="text-black-500 font-medium">
                    {format(new Date(evaluation.endDate), 'yyyy-MM-dd', {
                      locale: arSA,
                    })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-black-600">
                  تاريخ الإنشاء
                </p>
                <p className="text-black-500 font-medium">
                  {format(new Date(evaluation.createdAt), 'yyyy-MM-dd', {
                    locale: arSA,
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-black-600">
                  عدد المعايير
                </p>
                <p className="text-black-500 font-medium">
                  {criteria.length} معيار
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

