'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminEvaluationsAPI, adminCriteriaAPI, adminUploadAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, Plus, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'

export default function EditEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    image: '',
    type: 'SELF_ASSESSMENT',
    startDate: '',
    endDate: '',
  })
  const [criteria, setCriteria] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (admin && params.id) {
      fetchEvaluation()
      fetchCriteria()
    }
  }, [admin, params.id])

  const fetchEvaluation = async () => {
    try {
      setLoading(true)
      const response = await adminEvaluationsAPI.getById(params.id)
      const evaluation = response.data.evaluation
      setFormData({
        title: evaluation.title || '',
        titleAr: evaluation.titleAr || '',
        description: evaluation.description || '',
        descriptionAr: evaluation.descriptionAr || '',
        image: evaluation.image || '',
        type: evaluation.type || 'SELF_ASSESSMENT',
        startDate: evaluation.startDate 
          ? new Date(evaluation.startDate).toISOString().slice(0, 16)
          : '',
        endDate: evaluation.endDate
          ? new Date(evaluation.endDate).toISOString().slice(0, 16)
          : '',
      })
      setImagePreview(evaluation.image || '')
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      await adminEvaluationsAPI.update(params.id, {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      })
      toast.success('تم تحديث التقييم بنجاح')
      router.push('/dashboard/evaluations')
    } catch (error) {
      console.error('Error updating evaluation:', error)
      toast.error(error.response?.data?.error || 'فشل تحديث التقييم')
    } finally {
      setSaving(false)
    }
  }

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
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
      },
    ])
  }

  const updateCriterion = (index, field, value) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  const removeCriterion = async (index) => {
    const criterion = criteria[index]
    if (criterion.id) {
      // Delete existing criterion from backend
      try {
        await adminCriteriaAPI.delete(criterion.id)
        toast.success('تم حذف السؤال')
      } catch (error) {
        toast.error('فشل حذف السؤال')
        return
      }
    }
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const saveCriterion = async (index) => {
    const criterion = criteria[index]
    try {
      if (criterion.id) {
        // Update existing
        await adminCriteriaAPI.update(criterion.id, {
          ...criterion,
          evaluationId: parseInt(params.id),
        })
        toast.success('تم تحديث السؤال')
      } else {
        // Create new
        const response = await adminCriteriaAPI.create({
          ...criterion,
          evaluationId: parseInt(params.id),
          order: index,
        })
        const updated = [...criteria]
        updated[index] = response.data.criterion
        setCriteria(updated)
        toast.success('تم إضافة السؤال')
      }
    } catch (error) {
      toast.error('فشل حفظ السؤال')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (e.target.name === 'image') {
      setImagePreview(e.target.value)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }

    try {
      setUploadingImage(true)
      const response = await adminUploadAPI.uploadImage(file)
      const imageUrl = response.data.url
      
      setFormData({
        ...formData,
        image: imageUrl,
      })
      setImagePreview(imageUrl)
      toast.success('تم رفع الصورة بنجاح')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error.response?.data?.error || 'فشل رفع الصورة')
    } finally {
      setUploadingImage(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: '',
    })
    setImagePreview('')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            تعديل التقييم
          </h1>
          <p className="mt-2 text-black-600">
            تعديل معلومات التقييم
          </p>
        </div>
        <Link
          href="/dashboard/evaluations"
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
              العنوان (إنجليزي) *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              العنوان (عربي)
            </label>
            <input
              type="text"
              name="titleAr"
              value={formData.titleAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              نوع التقييم *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            >
              <option value="SELF_ASSESSMENT">تقييم ذاتي</option>
              <option value="PEER_REVIEW">تقييم الأقران</option>
              <option value="MANAGER_REVIEW">تقييم المدير</option>
              <option value="PERFORMANCE_REVIEW">تقييم الأداء</option>
              <option value="TEAM_EVALUATION">تقييم الفريق</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              تاريخ البدء
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              تاريخ الانتهاء
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black-500 mb-2">
              صورة التقييم
            </label>
            
            {/* Upload Button */}
            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors">
                <Upload className="ml-2 w-5 h-5" />
                {uploadingImage ? 'جاري الرفع...' : 'رفع صورة'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <span className="mr-3 text-sm text-black-600">أو</span>
            </div>

            {/* URL Input */}
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="أدخل رابط URL للصورة أو ارفع صورة من جهازك"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border border-black-100"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black-500 mb-2">
            الوصف (إنجليزي)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
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
            rows={4}
            className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
          />
        </div>

        {/* Criteria Section */}
        <div className="border-t border-black-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black-500">الأسئلة (المعايير)</h2>
            <button
              type="button"
              onClick={addCriterion}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة سؤال
            </button>
          </div>

          {criteria.length === 0 ? (
            <p className="text-black-600 text-center py-8">
              لا توجد أسئلة. اضغط على &quot;إضافة سؤال&quot; لإضافة أسئلة للتقييم.
            </p>
          ) : (
            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id || index}
                  className="border border-black-100 rounded-lg p-4 bg-black-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black-500">
                      سؤال #{index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveCriterion(index)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        السؤال (إنجليزي) *
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updateCriterion(index, 'title', e.target.value)}
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
                        value={criterion.titleAr || ''}
                        onChange={(e) => updateCriterion(index, 'titleAr', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="عنوان السؤال"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الوصف (إنجليزي)
                      </label>
                      <textarea
                        value={criterion.description || ''}
                        onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الوصف (عربي)
                      </label>
                      <textarea
                        value={criterion.descriptionAr || ''}
                        onChange={(e) => updateCriterion(index, 'descriptionAr', e.target.value)}
                        rows={2}
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
                        step="0.1"
                        min="0"
                        value={criterion.weight}
                        onChange={(e) => updateCriterion(index, 'weight', parseFloat(e.target.value) || 1.0)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الحد الأقصى للدرجة
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={criterion.maxScore}
                        onChange={(e) => updateCriterion(index, 'maxScore', parseFloat(e.target.value) || 10.0)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        نسبة السؤال في التقييم (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={criterion.questionPercentage || 0}
                        onChange={(e) => updateCriterion(index, 'questionPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                      />
                      <p className="text-xs text-black-400 mt-1">
                        النسبة المئوية التي يمثلها هذا السؤال في التقييم الكلي
                      </p>
                    </div>

                    {/* Answer Percentages */}
                    <div className="md:col-span-2 border-t border-black-100 pt-4 mt-4">
                      <label className="block text-sm font-medium text-black-500 mb-3">
                        النسب المئوية للإجابات الخمسة (يجب أن يكون المجموع 100%)
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                        {[
                          { key: 'answer1Percentage', label: '1 - لا ينطبق', color: 'red' },
                          { key: 'answer2Percentage', label: '2 - ينطبق قليلاً', color: 'orange' },
                          { key: 'answer3Percentage', label: '3 - ينطبق إلى حد ما', color: 'yellow' },
                          { key: 'answer4Percentage', label: '4 - ينطبق كثيراً', color: 'blue' },
                          { key: 'answer5Percentage', label: '5 - ينطبق تماماً', color: 'green' },
                        ].map((option) => {
                          return (
                            <div key={option.key}>
                              <label className="block text-xs text-black-600 mb-1">{option.label}</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={criterion[option.key] || 0}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  updateCriterion(index, option.key, value)
                                }}
                                className="w-full px-2 py-1 text-sm border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                              />
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2">
                        <p className={`text-xs font-medium ${(() => {
                          const total = (criterion.answer1Percentage || 0) + 
                                       (criterion.answer2Percentage || 0) + 
                                       (criterion.answer3Percentage || 0) + 
                                       (criterion.answer4Percentage || 0) + 
                                       (criterion.answer5Percentage || 0)
                          return total === 100 ? 'text-green-600' : 'text-red-600'
                        })()}`}>
                          المجموع: {((criterion.answer1Percentage || 0) + 
                                   (criterion.answer2Percentage || 0) + 
                                   (criterion.answer3Percentage || 0) + 
                                   (criterion.answer4Percentage || 0) + 
                                   (criterion.answer5Percentage || 0)).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={criterion.isRequired}
                          onChange={(e) => updateCriterion(index, 'isRequired', e.target.checked)}
                          className="ml-2 w-4 h-4 text-primary-500 border-black-100 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-black-600">سؤال مطلوب</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Save className="ml-2 w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <Link href="/dashboard/evaluations" className="btn-secondary">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
