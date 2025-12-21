'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminEvaluationsAPI, adminCriteriaAPI, adminUploadAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, Plus, X, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewEvaluationPage() {
  const router = useRouter()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(false)
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
  const [practicesCriteria, setPracticesCriteria] = useState([])
  const [patternsCriteria, setPatternsCriteria] = useState([])
  const [practicesPercentage, setPracticesPercentage] = useState(50)
  const [patternsPercentage, setPatternsPercentage] = useState(50)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      // Validate percentages
      if (practicesPercentage + patternsPercentage !== 100) {
        toast.error('يجب أن يكون مجموع النسب المئوية للممارسات والأنماط 100%')
        return
      }

      const response = await adminEvaluationsAPI.create({
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        practicesPercentage: practicesPercentage,
        patternsPercentage: patternsPercentage,
      })
      const evaluationId = response.data.evaluation.id
      
      // Create practices criteria
      if (practicesCriteria.length > 0) {
        await Promise.all(
          practicesCriteria.map((criterion, index) =>
            adminCriteriaAPI.create({
              evaluationId,
              ...criterion,
              bookType: 'PRACTICES',
              order: index,
            })
          )
        )
      }
      
      // Create patterns criteria
      if (patternsCriteria.length > 0) {
        await Promise.all(
          patternsCriteria.map((criterion, index) =>
            adminCriteriaAPI.create({
              evaluationId,
              ...criterion,
              bookType: 'PATTERNS',
              order: index,
            })
          )
        )
      }
      
      // Save percentages as settings or in evaluation description
      // For now, we'll store it in the description or create a separate API call
      
      toast.success('تم إضافة التقييم بنجاح')
      router.push('/dashboard/evaluations')
    } catch (error) {
      console.error('Error creating evaluation:', error)
      toast.error(error.response?.data?.error || 'فشل إضافة التقييم')
    } finally {
      setLoading(false)
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

  const addPracticesCriterion = () => {
    setPracticesCriteria([
      ...practicesCriteria,
      {
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        weight: 1.0,
        maxScore: 10.0,
        isRequired: true,
        answer1Percentage: 20, // لا ينطبق
        answer2Percentage: 20, // ينطبق قليلاً
        answer3Percentage: 20, // ينطبق إلى حد ما
        answer4Percentage: 20, // ينطبق كثيراً
        answer5Percentage: 20, // ينطبق تماماً
      },
    ])
  }

  const addPatternsCriterion = () => {
    setPatternsCriteria([
      ...patternsCriteria,
      {
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        weight: 1.0,
        maxScore: 10.0,
        isRequired: true,
        answer1Percentage: 20, // لا ينطبق
        answer2Percentage: 20, // ينطبق قليلاً
        answer3Percentage: 20, // ينطبق إلى حد ما
        answer4Percentage: 20, // ينطبق كثيراً
        answer5Percentage: 20, // ينطبق تماماً
      },
    ])
  }

  const updatePracticesCriterion = (index, field, value) => {
    const updated = [...practicesCriteria]
    updated[index] = { ...updated[index], [field]: value }
    setPracticesCriteria(updated)
  }

  const updatePatternsCriterion = (index, field, value) => {
    const updated = [...patternsCriteria]
    updated[index] = { ...updated[index], [field]: value }
    setPatternsCriteria(updated)
  }

  const removePracticesCriterion = (index) => {
    setPracticesCriteria(practicesCriteria.filter((_, i) => i !== index))
  }

  const removePatternsCriterion = (index) => {
    setPatternsCriteria(patternsCriteria.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            إضافة تقييم جديد
          </h1>
          <p className="mt-2 text-black-600">
            أنشئ تقييماً جديداً
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
              placeholder="Evaluation Title"
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
              placeholder="عنوان التقييم"
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
            placeholder="Evaluation Description"
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
            placeholder="وصف التقييم"
          />
        </div>

        {/* Percentage Section */}
        <div className="border-t border-black-100 pt-6">
          <h2 className="text-xl font-bold text-black-500 mb-4">النسب المئوية للمحاور</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-black-500 mb-2">
                نسبة الممارسات (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={practicesPercentage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setPracticesPercentage(value)
                  setPatternsPercentage(100 - value)
                }}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
              <p className="text-xs text-black-400 mt-1">
                النسبة المئوية التي سيتم على أساسها تحديد الكتب الموصى بها من نوع الممارسات
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="block text-sm font-medium text-black-500 mb-2">
                نسبة الأنماط (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={patternsPercentage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setPatternsPercentage(value)
                  setPracticesPercentage(100 - value)
                }}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
              <p className="text-xs text-black-400 mt-1">
                النسبة المئوية التي سيتم على أساسها تحديد الكتب الموصى بها من نوع الأنماط
              </p>
            </div>
          </div>
          <div className="mb-4">
            <p className={`text-sm font-medium ${practicesPercentage + patternsPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
              المجموع: {practicesPercentage + patternsPercentage}%
              {practicesPercentage + patternsPercentage !== 100 && ' (يجب أن يكون المجموع 100%)'}
            </p>
          </div>
        </div>

        {/* Practices Criteria Section */}
        <div className="border-t border-black-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black-500">أسئلة الممارسات</h2>
              <p className="text-sm text-black-600 mt-1">أسئلة خاصة بكتب الممارسات (النسبة: {practicesPercentage}%)</p>
            </div>
            <button
              type="button"
              onClick={addPracticesCriterion}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة سؤال ممارسات
            </button>
          </div>

          {practicesCriteria.length === 0 ? (
            <p className="text-black-600 text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
              لا توجد أسئلة للممارسات. اضغط على &quot;إضافة سؤال ممارسات&quot; لإضافة أسئلة.
            </p>
          ) : (
            <div className="space-y-4">
              {practicesCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black-500">
                      سؤال ممارسات #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removePracticesCriterion(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (إنجليزي) *
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updatePracticesCriterion(index, 'title', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (عربي)
                      </label>
                      <input
                        type="text"
                        value={criterion.titleAr}
                        onChange={(e) => updatePracticesCriterion(index, 'titleAr', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="عنوان السؤال"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (إنجليزي)
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => updatePracticesCriterion(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Content"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (عربي)
                      </label>
                      <textarea
                        value={criterion.descriptionAr}
                        onChange={(e) => updatePracticesCriterion(index, 'descriptionAr', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="مضمون السؤال"
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
                        onChange={(e) => updatePracticesCriterion(index, 'maxScore', parseFloat(e.target.value) || 10.0)}
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
                        onChange={(e) => updatePracticesCriterion(index, 'questionPercentage', parseFloat(e.target.value) || 0)}
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
                          const total = (criterion.answer1Percentage || 0) + 
                                       (criterion.answer2Percentage || 0) + 
                                       (criterion.answer3Percentage || 0) + 
                                       (criterion.answer4Percentage || 0) + 
                                       (criterion.answer5Percentage || 0)
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
                                  updatePracticesCriterion(index, option.key, value)
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
                          onChange={(e) => updatePracticesCriterion(index, 'isRequired', e.target.checked)}
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

        {/* Patterns Criteria Section */}
        <div className="border-t border-black-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black-500">أسئلة الأنماط</h2>
              <p className="text-sm text-black-600 mt-1">أسئلة خاصة بكتب الأنماط (النسبة: {patternsPercentage}%)</p>
            </div>
            <button
              type="button"
              onClick={addPatternsCriterion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة سؤال أنماط
            </button>
          </div>

          {patternsCriteria.length === 0 ? (
            <p className="text-black-600 text-center py-8 bg-green-50 rounded-lg border border-green-200">
              لا توجد أسئلة للأنماط. اضغط على &quot;إضافة سؤال أنماط&quot; لإضافة أسئلة.
            </p>
          ) : (
            <div className="space-y-4">
              {patternsCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="border border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black-500">
                      سؤال أنماط #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removePatternsCriterion(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (إنجليزي) *
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updatePatternsCriterion(index, 'title', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (عربي)
                      </label>
                      <input
                        type="text"
                        value={criterion.titleAr}
                        onChange={(e) => updatePatternsCriterion(index, 'titleAr', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="عنوان السؤال"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (إنجليزي)
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => updatePatternsCriterion(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Content"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (عربي)
                      </label>
                      <textarea
                        value={criterion.descriptionAr}
                        onChange={(e) => updatePatternsCriterion(index, 'descriptionAr', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="مضمون السؤال"
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
                        onChange={(e) => updatePatternsCriterion(index, 'maxScore', parseFloat(e.target.value) || 10.0)}
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
                        onChange={(e) => updatePatternsCriterion(index, 'questionPercentage', parseFloat(e.target.value) || 0)}
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
                                  updatePatternsCriterion(index, option.key, value)
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
                          onChange={(e) => updatePatternsCriterion(index, 'isRequired', e.target.checked)}
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
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Save className="ml-2 w-5 h-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <Link href="/dashboard/evaluations" className="btn-secondary">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}



    updated[index] = { ...updated[index], [field]: value }
    setPatternsCriteria(updated)
  }

  const removePracticesCriterion = (index) => {
    setPracticesCriteria(practicesCriteria.filter((_, i) => i !== index))
  }

  const removePatternsCriterion = (index) => {
    setPatternsCriteria(patternsCriteria.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            إضافة تقييم جديد
          </h1>
          <p className="mt-2 text-black-600">
            أنشئ تقييماً جديداً
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
              placeholder="Evaluation Title"
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
              placeholder="عنوان التقييم"
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
            placeholder="Evaluation Description"
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
            placeholder="وصف التقييم"
          />
        </div>

        {/* Percentage Section */}
        <div className="border-t border-black-100 pt-6">
          <h2 className="text-xl font-bold text-black-500 mb-4">النسب المئوية للمحاور</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-black-500 mb-2">
                نسبة الممارسات (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={practicesPercentage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setPracticesPercentage(value)
                  setPatternsPercentage(100 - value)
                }}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
              <p className="text-xs text-black-400 mt-1">
                النسبة المئوية التي سيتم على أساسها تحديد الكتب الموصى بها من نوع الممارسات
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="block text-sm font-medium text-black-500 mb-2">
                نسبة الأنماط (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={patternsPercentage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setPatternsPercentage(value)
                  setPracticesPercentage(100 - value)
                }}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              />
              <p className="text-xs text-black-400 mt-1">
                النسبة المئوية التي سيتم على أساسها تحديد الكتب الموصى بها من نوع الأنماط
              </p>
            </div>
          </div>
          <div className="mb-4">
            <p className={`text-sm font-medium ${practicesPercentage + patternsPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
              المجموع: {practicesPercentage + patternsPercentage}%
              {practicesPercentage + patternsPercentage !== 100 && ' (يجب أن يكون المجموع 100%)'}
            </p>
          </div>
        </div>

        {/* Practices Criteria Section */}
        <div className="border-t border-black-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black-500">أسئلة الممارسات</h2>
              <p className="text-sm text-black-600 mt-1">أسئلة خاصة بكتب الممارسات (النسبة: {practicesPercentage}%)</p>
            </div>
            <button
              type="button"
              onClick={addPracticesCriterion}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة سؤال ممارسات
            </button>
          </div>

          {practicesCriteria.length === 0 ? (
            <p className="text-black-600 text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
              لا توجد أسئلة للممارسات. اضغط على &quot;إضافة سؤال ممارسات&quot; لإضافة أسئلة.
            </p>
          ) : (
            <div className="space-y-4">
              {practicesCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black-500">
                      سؤال ممارسات #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removePracticesCriterion(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (إنجليزي) *
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updatePracticesCriterion(index, 'title', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (عربي)
                      </label>
                      <input
                        type="text"
                        value={criterion.titleAr}
                        onChange={(e) => updatePracticesCriterion(index, 'titleAr', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="عنوان السؤال"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (إنجليزي)
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => updatePracticesCriterion(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Content"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (عربي)
                      </label>
                      <textarea
                        value={criterion.descriptionAr}
                        onChange={(e) => updatePracticesCriterion(index, 'descriptionAr', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="مضمون السؤال"
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
                        onChange={(e) => updatePracticesCriterion(index, 'maxScore', parseFloat(e.target.value) || 10.0)}
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
                        onChange={(e) => updatePracticesCriterion(index, 'questionPercentage', parseFloat(e.target.value) || 0)}
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
                          const total = (criterion.answer1Percentage || 0) + 
                                       (criterion.answer2Percentage || 0) + 
                                       (criterion.answer3Percentage || 0) + 
                                       (criterion.answer4Percentage || 0) + 
                                       (criterion.answer5Percentage || 0)
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
                                  updatePracticesCriterion(index, option.key, value)
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
                          onChange={(e) => updatePracticesCriterion(index, 'isRequired', e.target.checked)}
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

        {/* Patterns Criteria Section */}
        <div className="border-t border-black-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black-500">أسئلة الأنماط</h2>
              <p className="text-sm text-black-600 mt-1">أسئلة خاصة بكتب الأنماط (النسبة: {patternsPercentage}%)</p>
            </div>
            <button
              type="button"
              onClick={addPatternsCriterion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <Plus className="ml-2 w-5 h-5" />
              إضافة سؤال أنماط
            </button>
          </div>

          {patternsCriteria.length === 0 ? (
            <p className="text-black-600 text-center py-8 bg-green-50 rounded-lg border border-green-200">
              لا توجد أسئلة للأنماط. اضغط على &quot;إضافة سؤال أنماط&quot; لإضافة أسئلة.
            </p>
          ) : (
            <div className="space-y-4">
              {patternsCriteria.map((criterion, index) => (
                <div
                  key={index}
                  className="border border-green-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black-500">
                      سؤال أنماط #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removePatternsCriterion(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (إنجليزي) *
                      </label>
                      <input
                        type="text"
                        value={criterion.title}
                        onChange={(e) => updatePatternsCriterion(index, 'title', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        عنوان السؤال (عربي)
                      </label>
                      <input
                        type="text"
                        value={criterion.titleAr}
                        onChange={(e) => updatePatternsCriterion(index, 'titleAr', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="عنوان السؤال"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (إنجليزي)
                      </label>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => updatePatternsCriterion(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="Question Content"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        مضمون السؤال (عربي)
                      </label>
                      <textarea
                        value={criterion.descriptionAr}
                        onChange={(e) => updatePatternsCriterion(index, 'descriptionAr', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                        placeholder="مضمون السؤال"
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
                        onChange={(e) => updatePatternsCriterion(index, 'maxScore', parseFloat(e.target.value) || 10.0)}
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
                        onChange={(e) => updatePatternsCriterion(index, 'questionPercentage', parseFloat(e.target.value) || 0)}
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
                                  updatePatternsCriterion(index, option.key, value)
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
                          onChange={(e) => updatePatternsCriterion(index, 'isRequired', e.target.checked)}
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
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Save className="ml-2 w-5 h-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <Link href="/dashboard/evaluations" className="btn-secondary">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}


