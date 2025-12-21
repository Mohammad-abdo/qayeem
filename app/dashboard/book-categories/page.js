'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminBookCategoriesAPI, adminEvaluationsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, FileText, ArrowRight, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useConfirm } from '@/hooks/useConfirm'

export default function BookCategoriesPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [categories, setCategories] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { confirm } = useConfirm()
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    evaluationId: '',
    order: 0,
    isActive: true,
  })
  const [warningMessage, setWarningMessage] = useState('')

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    } else if (admin) {
      fetchCategories()
      fetchEvaluations()
    }
  }, [admin, authLoading, router])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await adminBookCategoriesAPI.getAll()
      setCategories(response.data.categories || [])
    } catch (error) {
      toast.error('فشل تحميل المحاور')
    } finally {
      setLoading(false)
    }
  }

  const fetchEvaluations = async () => {
    try {
      const response = await adminEvaluationsAPI.getAll()
      setEvaluations(response.data.evaluations || [])
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await adminBookCategoriesAPI.update(editingCategory.id, formData)
        toast.success('تم تحديث المحور بنجاح')
      } else {
        await adminBookCategoriesAPI.create(formData)
        toast.success('تم إضافة المحور بنجاح')
      }
      setShowModal(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل حفظ المحور')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      nameAr: category.nameAr || '',
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      evaluationId: category.evaluationId || '',
      order: category.order || 0,
      isActive: category.isActive !== false,
    })
    setWarningMessage('')
    setShowModal(true)
  }

  const checkCategoryUsage = (categoryId, newEvaluationId) => {
    if (!categoryId || !newEvaluationId) {
      setWarningMessage('')
      return
    }

    // Find the category being edited
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) {
      setWarningMessage('')
      return
    }

    // Check if this category is already linked to a different evaluation
    if (category.evaluationId && category.evaluationId !== parseInt(newEvaluationId)) {
      const previousEvaluation = evaluations.find(e => e.id === category.evaluationId)
      const newEvaluation = evaluations.find(e => e.id === parseInt(newEvaluationId))
      
      if (previousEvaluation) {
        setWarningMessage(
          `⚠️ تحذير: هذا المحور (${category.nameAr || category.name}) مرتبط حالياً بتقييم آخر (${previousEvaluation.titleAr || previousEvaluation.title}). ` +
          `ربطه بتقييم جديد (${newEvaluation?.titleAr || newEvaluation?.title || 'جديد'}) قد يؤثر على التقييمات السابقة التي استخدمت هذا المحور.`
        )
      } else {
        setWarningMessage('')
      }
    } else {
      setWarningMessage('')
    }
  }

  const handleEvaluationIdChange = (e) => {
    const newEvaluationId = e.target.value
    setFormData({ ...formData, evaluationId: newEvaluationId })
    
    if (editingCategory) {
      checkCategoryUsage(editingCategory.id, newEvaluationId)
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا المحور؟', async () => {
      try {
        await adminBookCategoriesAPI.delete(id)
        toast.success('تم حذف المحور بنجاح')
        fetchCategories()
      } catch (error) {
        toast.error(error.response?.data?.error || 'فشل حذف المحور')
      }
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      evaluationId: '',
      order: 0,
      isActive: true,
    })
    setEditingCategory(null)
    setWarningMessage('')
  }

  if (authLoading || loading) {
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
              إدارة محاور الكتب
            </h1>
            <p className="text-primary-100 text-lg">
              إدارة محاور الكتب وتصنيفها
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            إضافة محور
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600 mb-4">لا توجد محاور</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              إضافة محور جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-black-100 rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-black-500 text-lg mb-1">
                      {category.nameAr || category.name}
                    </h3>
                    {category.name && category.nameAr && (
                      <p className="text-sm text-black-600">{category.name}</p>
                    )}
                    {category.evaluation && (
                      <p className="text-xs text-primary-600 mt-2">
                        مرتبط بتقييم: {category.evaluation.titleAr || category.evaluation.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {category.descriptionAr && (
                  <p className="text-sm text-black-600 mb-3 line-clamp-2">
                    {category.descriptionAr}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-black-400">
                  <span>{category._count?.books || 0} كتاب</span>
                  <span className={category.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {category.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black-500">
                {editingCategory ? 'تعديل المحور' : 'إضافة محور جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 text-black-400 hover:text-black-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    الاسم (إنجليزي) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    الاسم (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  الوصف (عربي)
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  التقييم المرتبط (اختياري)
                </label>
                <select
                  value={formData.evaluationId}
                  onChange={handleEvaluationIdChange}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">بدون تقييم</option>
                  {evaluations.map((evaluation) => (
                    <option key={evaluation.id} value={evaluation.id}>
                      {evaluation.titleAr || evaluation.title}
                    </option>
                  ))}
                </select>
                {warningMessage && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">{warningMessage}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-black-600">
                    نشط
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {editingCategory ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-black-500 rounded-lg hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

