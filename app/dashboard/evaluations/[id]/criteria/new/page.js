'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminCriteriaAPI, adminEvaluationsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function NewCriterionPage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    weight: 1.0,
    maxScore: 10.0,
    isRequired: true,
    bookType: null,
    questionPercentage: 0,
    answer1Percentage: 20,
    answer2Percentage: 20,
    answer3Percentage: 20,
    answer4Percentage: 20,
    answer5Percentage: 20,
  })

  useEffect(() => {
    if (admin && params.id) {
      fetchEvaluation()
    }
  }, [admin, params.id])

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    })
  }

  const handleAnswerPercentageChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: parseFloat(value) || 0,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate answer percentages sum to 100
    const total = formData.answer1Percentage + 
                  formData.answer2Percentage + 
                  formData.answer3Percentage + 
                  formData.answer4Percentage + 
                  formData.answer5Percentage

    if (Math.abs(total - 100) > 0.1) {
      toast.error('يجب أن يكون مجموع النسب المئوية للإجابات 100%')
      return
    }

    try {
      setSaving(true)
      await adminCriteriaAPI.create({
        ...formData,
        evaluationId: parseInt(params.id),
        order: 0, // Will be set by backend if needed
      })
      toast.success('تم إضافة السؤال بنجاح')
      router.push(`/dashboard/evaluations/${params.id}/edit`)
    } catch (error) {
      console.error('Error creating criterion:', error)
      toast.error(error.response?.data?.error || 'فشل إضافة السؤال')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const totalPercentage = formData.answer1Percentage + 
                          formData.answer2Percentage + 
                          formData.answer3Percentage + 
                          formData.answer4Percentage + 
                          formData.answer5Percentage

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            إضافة سؤال جديد
          </h1>
          <p className="mt-2 text-black-600">
            {evaluation && `إضافة سؤال جديد للتقييم: ${evaluation.titleAr || evaluation.title}`}
          </p>
        </div>
        <Link
          href={`/dashboard/evaluations/${params.id}/edit`}
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
              السؤال (إنجليزي) *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="Question Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              السؤال (عربي)
            </label>
            <input
              type="text"
              name="titleAr"
              value={formData.titleAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="عنوان السؤال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الوصف (إنجليزي)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="Question Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الوصف (عربي)
            </label>
            <textarea
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="وصف السؤال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الوزن
            </label>
            <input
              type="number"
              name="weight"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الحد الأقصى للدرجة
            </label>
            <input
              type="number"
              name="maxScore"
              step="0.1"
              min="0"
              value={formData.maxScore}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              نسبة السؤال في التقييم (%)
            </label>
            <input
              type="number"
              name="questionPercentage"
              step="0.1"
              min="0"
              max="100"
              value={formData.questionPercentage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
            <p className="text-xs text-black-400 mt-1">
              النسبة المئوية التي يمثلها هذا السؤال في التقييم الكلي
            </p>
          </div>

          <div>
            <label className="flex items-center mt-8">
              <input
                type="checkbox"
                name="isRequired"
                checked={formData.isRequired}
                onChange={handleChange}
                className="ml-2 w-4 h-4 text-primary-500 border-black-100 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-black-600">سؤال مطلوب</span>
            </label>
          </div>
        </div>

        {/* Answer Percentages */}
        <div className="border-t border-black-100 pt-6">
          <label className="block text-sm font-medium text-black-500 mb-3">
            النسب المئوية للإجابات الخمسة (يجب أن يكون المجموع 100%)
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {[
              { key: 'answer1Percentage', label: '1 - لا ينطبق', color: 'red' },
              { key: 'answer2Percentage', label: '2 - ينطبق قليلاً', color: 'orange' },
              { key: 'answer3Percentage', label: '3 - ينطبق إلى حد ما', color: 'yellow' },
              { key: 'answer4Percentage', label: '4 - ينطبق كثيراً', color: 'blue' },
              { key: 'answer5Percentage', label: '5 - ينطبق تماماً', color: 'green' },
            ].map((option) => (
              <div key={option.key}>
                <label className="block text-xs text-black-600 mb-1">{option.label}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData[option.key]}
                  onChange={(e) => handleAnswerPercentageChange(option.key, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <p className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
              المجموع: {totalPercentage.toFixed(1)}%
              {totalPercentage !== 100 && (
                <span className="mr-2 text-xs">(يجب أن يكون 100%)</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse pt-4 border-t border-black-100">
          <button
            type="submit"
            disabled={saving || totalPercentage !== 100}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="ml-2 w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ السؤال'}
          </button>
          <Link 
            href={`/dashboard/evaluations/${params.id}/edit`}
            className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}



