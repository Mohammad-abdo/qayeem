'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminBooksAPI, adminBookEvaluationsAPI, adminEvaluationsAPI, adminBookCategoriesAPI, adminUploadAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Save, Plus, X, HelpCircle, FileText, Upload, Image as ImageIcon } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'

export default function EditBookPage() {
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
    author: '',
    authorAr: '',
    isbn: '',
    price: '',
    discountPercentage: 0,
    categoryId: null,
    coverImage: '',
    stock: 0,
    status: 'ACTIVE',
  })
  const [faqItems, setFaqItems] = useState([])
  const [allEvaluations, setAllEvaluations] = useState([])
  const [bookEvaluations, setBookEvaluations] = useState([])
  const [bookCategories, setBookCategories] = useState([])
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('')
  const [isRequired, setIsRequired] = useState(false)
  const [minScorePercentage, setMinScorePercentage] = useState(70)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (admin && params.id) {
      fetchBook()
      fetchEvaluations()
      fetchBookEvaluations()
      fetchBookCategories()
    }
  }, [admin, params.id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await adminBooksAPI.getById(params.id)
      const book = response.data.book
      setFormData({
        title: book.title || '',
        titleAr: book.titleAr || '',
        description: book.description || '',
        descriptionAr: book.descriptionAr || '',
        author: book.author || '',
        authorAr: book.authorAr || '',
        isbn: book.isbn || '',
        price: book.price || '',
        discountPercentage: book.discountPercentage || 0,
        categoryId: book.categoryId || null,
        coverImage: book.coverImage || '',
        stock: book.stock || 0,
        status: book.status || 'ACTIVE',
      })
      
      // Set image preview
      if (book.coverImage) {
        setImagePreview(book.coverImage)
      }
      
      // Parse FAQ if it exists
      if (book.faq) {
        try {
          const parsed = typeof book.faq === 'string' ? JSON.parse(book.faq) : book.faq
          setFaqItems(Array.isArray(parsed) ? parsed : [])
        } catch {
          setFaqItems([])
        }
      }
    } catch (error) {
      toast.error('فشل تحميل بيانات الكتاب')
      router.push('/dashboard/books')
    } finally {
      setLoading(false)
    }
  }

  const fetchEvaluations = async () => {
    try {
      const response = await adminEvaluationsAPI.getAll()
      setAllEvaluations(response.data.evaluations || [])
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const fetchBookEvaluations = async () => {
    try {
      const response = await adminBookEvaluationsAPI.getBookEvaluations(params.id)
      // The API returns evaluations with minScorePercentage
      const evaluations = response.data.evaluations || []
      setBookEvaluations(evaluations)
    } catch (error) {
      console.error('Error fetching book evaluations:', error)
      setBookEvaluations([])
    }
  }

  const fetchBookCategories = async () => {
    try {
      const response = await adminBookCategoriesAPI.getAll()
      setBookCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleLinkEvaluation = async () => {
    if (!selectedEvaluationId) {
      toast.error('يرجى اختيار تقييم')
      return
    }

    try {
      await adminBookEvaluationsAPI.link({
        bookId: params.id,
        evaluationId: selectedEvaluationId,
        isRequired,
        minScorePercentage: parseFloat(minScorePercentage) || 70.0,
      })
      toast.success('تم ربط التقييم بالكتاب بنجاح')
      setShowEvaluationModal(false)
      setSelectedEvaluationId('')
      setIsRequired(false)
      setMinScorePercentage(70)
      fetchBookEvaluations()
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل ربط التقييم')
    }
  }

  const handleUpdateMinScore = async (evaluationId, newMinScore) => {
    try {
      await adminBookEvaluationsAPI.updateLink(params.id, evaluationId, {
        minScorePercentage: parseFloat(newMinScore) || 70.0,
      })
      toast.success('تم تحديث النسبة المئوية الدنيا')
      fetchBookEvaluations()
    } catch (error) {
      toast.error('فشل تحديث النسبة المئوية')
    }
  }

  const handleUnlinkEvaluation = async (evaluationId) => {
    confirm('هل أنت متأكد من إلغاء ربط هذا التقييم؟', async () => {
      try {
        await adminBookEvaluationsAPI.unlink(params.id, evaluationId)
        toast.success('تم إلغاء ربط التقييم')
        fetchBookEvaluations()
      } catch (error) {
        toast.error('فشل إلغاء ربط التقييم')
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await adminBooksAPI.update(params.id, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        faq: faqItems.length > 0 ? JSON.stringify(faqItems) : null,
      })
      toast.success('تم تحديث الكتاب بنجاح')
      router.push('/dashboard/books')
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تحديث الكتاب')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Update image preview if coverImage changes
    if (e.target.name === 'coverImage') {
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
        coverImage: imageUrl,
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
      coverImage: '',
    })
    setImagePreview('')
  }

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', questionAr: '', answer: '', answerAr: '' }])
  }

  const removeFaqItem = (index) => {
    setFaqItems(faqItems.filter((_, i) => i !== index))
  }

  const updateFaqItem = (index, field, value) => {
    const updated = [...faqItems]
    updated[index][field] = value
    setFaqItems(updated)
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
              تعديل الكتاب
            </h1>
            <p className="text-primary-100 text-lg">
              تعديل معلومات الكتاب
            </p>
          </div>
          <Link
            href="/dashboard/books"
            className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            رجوع
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-black-100 space-y-8">
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
              المؤلف (إنجليزي)
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              المؤلف (عربي)
            </label>
            <input
              type="text"
              name="authorAr"
              value={formData.authorAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              السعر (ر.س) *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              نسبة الخصم (%) (0-100)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
              placeholder="0"
            />
            <p className="text-xs text-black-400 mt-1">
              نسبة الخصم التي سيتم تطبيقها على هذا الكتاب (0 = لا يوجد خصم)
            </p>
          </div>


          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              صورة الغلاف
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-black-100"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="mb-3">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-black-200 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  ) : (
                    <Upload className="w-6 h-6 text-black-400" />
                  )}
                  <span className="text-sm text-black-600">
                    {uploadingImage ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}
                  </span>
                  <span className="text-xs text-black-400">
                    PNG, JPG, GIF حتى 5 ميجابايت
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or URL Input */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ImageIcon className="w-5 h-5 text-black-400" />
              </div>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                placeholder="أو أدخل رابط الصورة (https://example.com/image.jpg)"
              />
            </div>
            <p className="text-xs text-black-400 mt-1">
              يمكنك رفع صورة من جهازك أو إدخال رابط صورة
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              المخزون
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الحالة
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            >
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="OUT_OF_STOCK">نفدت</option>
              <option value="ARCHIVED">مؤرشف</option>
            </select>
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
            rows={6}
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
            rows={6}
            className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
          />
        </div>

        {/* FAQ Section */}
        <div className="border-t border-black-100 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold text-black-500">
                الأسئلة الشائعة (FAQ)
              </h2>
            </div>
            <button
              type="button"
              onClick={addFaqItem}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة سؤال
            </button>
          </div>

          {faqItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-black-400 mb-4">لا توجد أسئلة شائعة</p>
              <button
                type="button"
                onClick={addFaqItem}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                إضافة سؤال جديد
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="border border-black-100 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-black-500">سؤال #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        السؤال (إنجليزي)
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                        placeholder="Question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        السؤال (عربي) *
                      </label>
                      <input
                        type="text"
                        value={faq.questionAr}
                        onChange={(e) => updateFaqItem(index, 'questionAr', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                        placeholder="السؤال"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الإجابة (إنجليزي)
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                        placeholder="Answer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الإجابة (عربي) *
                      </label>
                      <textarea
                        value={faq.answerAr}
                        onChange={(e) => updateFaqItem(index, 'answerAr', e.target.value)}
                        rows={3}
                        required
                        className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                        placeholder="الإجابة"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book Category Section */}
        <div className="border-t border-black-100 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-black-500">
              محور الكتاب
            </h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              اختر المحور
            </label>
            <select
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
            >
              <option value="">بدون محور</option>
              {bookCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr || cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Book Evaluations Section */}
        <div className="border-t border-black-100 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold text-black-500">
                التقييمات المرتبطة
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowEvaluationModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة تقييم
            </button>
          </div>

          {/* All Available Evaluations - Select to Link */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-black-100">
            <label className="block text-sm font-medium text-black-500 mb-3">
              جميع التقييمات المتاحة - اختر لإضافة/إزالة (Ctrl/Cmd للاختيار المتعدد)
            </label>
            <select
              multiple
              size={8}
              value={bookEvaluations.map(be => be.id.toString())}
              onChange={async (e) => {
                const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                const currentIds = bookEvaluations.map(be => be.id)
                
                // Find evaluations to add
                const toAdd = selectedIds.filter(id => !currentIds.includes(id))
                // Find evaluations to remove
                const toRemove = currentIds.filter(id => !selectedIds.includes(id))
                
                // Add new evaluations
                for (const id of toAdd) {
                  try {
                    await adminBookEvaluationsAPI.link({
                      bookId: params.id,
                      evaluationId: id,
                      isRequired: false,
                    })
                    toast.success('تم ربط التقييم')
                  } catch (error) {
                    toast.error('فشل ربط التقييم')
                  }
                }
                
                // Remove evaluations
                for (const id of toRemove) {
                  try {
                    await adminBookEvaluationsAPI.unlink(params.id, id)
                    toast.success('تم إلغاء ربط التقييم')
                  } catch (error) {
                    toast.error('فشل إلغاء ربط التقييم')
                  }
                }
                
                // Refresh the list
                if (toAdd.length > 0 || toRemove.length > 0) {
                  fetchBookEvaluations()
                }
              }}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
            >
              {allEvaluations.map((evaluation) => {
                const isLinked = bookEvaluations.find(be => be.id === evaluation.id)
                return (
                  <option 
                    key={evaluation.id} 
                    value={evaluation.id.toString()}
                    style={{ backgroundColor: isLinked ? '#dbeafe' : 'white' }}
                  >
                    {evaluation.titleAr || evaluation.title} 
                    {isLinked && ' ✓'} 
                    {evaluation.status !== 'ACTIVE' && ` (${evaluation.status})`}
                  </option>
                )
              })}
            </select>
            <div className="mt-3 flex items-center gap-4 text-xs text-black-500">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                مرتبط
              </span>
              <span className="text-black-400">
                {bookEvaluations.length} من {allEvaluations.length} تقييم مرتبط
              </span>
            </div>
            <p className="text-xs text-black-400 mt-2">
              💡 استخدم Ctrl (أو Cmd على Mac) + Click للاختيار المتعدد. التقييمات المحددة (باللون الأزرق) مرتبطة بالكتاب.
            </p>
          </div>

          {/* Linked Evaluations List */}
          {bookEvaluations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-black-400 mb-4">لا توجد تقييمات مرتبطة حالياً</p>
              <p className="text-sm text-black-300">استخدم القائمة أعلاه لاختيار التقييمات</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black-500 mb-3">
                التقييمات المرتبطة حالياً ({bookEvaluations.length})
              </h3>
              {bookEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="border border-primary-200 rounded-lg p-4 flex items-center justify-between bg-primary-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-black-500">{evaluation.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        evaluation.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {evaluation.status === 'ACTIVE' ? 'نشط' : evaluation.status}
                      </span>
                    </div>
                    {evaluation.titleAr && (
                      <p className="text-sm text-black-600 mb-2">{evaluation.titleAr}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-black-500">النسبة الدنيا:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={evaluation.minScorePercentage || 70}
                          onChange={(e) => handleUpdateMinScore(evaluation.id, e.target.value)}
                          className="w-20 px-2 py-1 text-xs border border-black-100 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <span className="text-xs text-black-400">%</span>
                      </div>
                      {evaluation.isRequired && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          مطلوب
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/evaluations/${evaluation.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block"
                      target="_blank"
                    >
                      عرض تفاصيل التقييم →
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnlinkEvaluation(evaluation.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    title="إلغاء الربط"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Modal */}
        {showEvaluationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-black-500 mb-4">
                إضافة تقييم للكتاب
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    اختر التقييم
                  </label>
                  <select
                    value={selectedEvaluationId}
                    onChange={(e) => setSelectedEvaluationId(e.target.value)}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                  >
                    <option value="">اختر تقييم</option>
                    {allEvaluations
                      .filter(evaluation => !bookEvaluations.find(be => be.id === evaluation.id))
                      .map((evaluation) => (
                        <option key={evaluation.id} value={evaluation.id}>
                          {evaluation.titleAr || evaluation.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={isRequired}
                      onChange={(e) => setIsRequired(e.target.checked)}
                      className="w-4 h-4 text-primary-500 border-black-100 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isRequired" className="text-sm text-black-600">
                      التقييم مطلوب
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black-500 mb-2">
                      النسبة المئوية الدنيا المطلوبة (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={minScorePercentage}
                      onChange={(e) => setMinScorePercentage(e.target.value)}
                      className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                      placeholder="70"
                    />
                    <p className="text-xs text-black-400 mt-1">
                      النسبة المئوية الدنيا التي يجب أن يحققها المستخدم في هذا التقييم ليتم التوصية بالكتاب (0-100)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleLinkEvaluation}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEvaluationModal(false)
                      setSelectedEvaluationId('')
                      setIsRequired(false)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-black-500 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-black-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <Link 
            href="/dashboard/books" 
            className="px-6 py-3 bg-black-50 text-black-500 rounded-xl hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors font-semibold"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
