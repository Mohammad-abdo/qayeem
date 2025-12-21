'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminBooksAPI, adminBookReviewsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Edit, BookOpen, Star, MessageSquare, Plus, Minus, HelpCircle, DollarSign, Users, TrendingUp, FileText, Download, BarChart3 } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [reviews, setReviews] = useState([])
  const [faqItems, setFaqItems] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBook()
      fetchReviews()
      fetchStatistics()
    }
  }, [params.id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await adminBooksAPI.getById(params.id)
      const bookData = response.data.book
      setBook(bookData)
      
      // Parse FAQ if it exists as JSON string or array
      if (bookData.faq) {
        try {
          const parsed = typeof bookData.faq === 'string' ? JSON.parse(bookData.faq) : bookData.faq
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

  const fetchReviews = async () => {
    try {
      const response = await adminBookReviewsAPI.getAll({
        bookId: params.id,
        limit: 50,
      })
      const reviewsData = response.data.reviews || []
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    }
  }

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true)
      const response = await adminBooksAPI.getStatistics(params.id)
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('فشل تحميل الإحصائيات')
    } finally {
      setLoadingStats(false)
    }
  }

  const generateReport = () => {
    if (!statistics) return
    
    const reportData = {
      book: {
        title: book.titleAr || book.title,
        id: book.id,
      },
      statistics: statistics.statistics,
      generatedAt: new Date().toLocaleString('ar-SA'),
    }
    
    const reportText = `
تقرير إحصائي للكتاب: ${reportData.book.title}
تاريخ التوليد: ${reportData.generatedAt}

إحصائيات المدفوعات:
- إجمالي المدفوعات: ${reportData.statistics.payments.total}
- إجمالي الإيرادات: ${reportData.statistics.payments.revenue.toFixed(2)} ر.س
- متوسط المبلغ: ${reportData.statistics.payments.averageAmount.toFixed(2)} ر.س

إحصائيات القراء:
- إجمالي القراء: ${reportData.statistics.readers.total}
- مكتمل القراءة: ${reportData.statistics.readers.completed}
- قيد القراءة: ${reportData.statistics.readers.inProgress}
- لم يبدأ: ${reportData.statistics.readers.notStarted}
- متوسط التقدم: ${reportData.statistics.readers.averageProgress.toFixed(1)}%

إحصائيات التقييمات:
- إجمالي التقييمات: ${reportData.statistics.reviews.total}
- متوسط التقييم: ${reportData.statistics.reviews.averageRating.toFixed(1)}/5
    `
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `book-report-${book.id}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('تم تحميل التقرير')
  }

  const handleApproveReview = async (reviewId) => {
    try {
      await adminBookReviewsAPI.approve(reviewId)
      toast.success('تم الموافقة على التقييم')
      fetchReviews()
    } catch (error) {
      toast.error('فشل الموافقة على التقييم')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    confirm('هل أنت متأكد من حذف هذا التقييم؟', async () => {
      try {
        await adminBookReviewsAPI.delete(reviewId)
        toast.success('تم حذف التقييم')
        fetchReviews()
      } catch (error) {
        toast.error('فشل حذف التقييم')
      }
    })
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {book.titleAr || book.title}
            </h1>
            {book.titleAr && book.title && (
              <p className="text-xl text-primary-100">
                {book.title}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/books/${book.id}/edit`}
              className="px-4 py-2 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold"
            >
              <Edit className="w-5 h-5" />
              تعديل
            </Link>
            <Link
              href="/dashboard/books"
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <ArrowRight className="w-5 h-5" />
              رجوع
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          {book.coverImage && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 overflow-hidden animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-[500px] object-cover rounded-xl"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black-100">
              <BookOpen className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold text-black-500">
                الوصف
              </h2>
            </div>
            {book.descriptionAr && (
              <div className="mb-4">
                <p className="text-black-600 leading-relaxed whitespace-pre-line text-lg">
                  {book.descriptionAr}
                </p>
              </div>
            )}
            {book.description && (
              <div>
                <p className="text-black-600 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}
            {!book.description && !book.descriptionAr && (
              <p className="text-black-400 text-center py-8">
                لا يوجد وصف متاح
              </p>
            )}
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-black-500">
                  الأسئلة الشائعة
                </h2>
              </div>
              <Link
                href={`/dashboard/books/${book.id}/edit`}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                إدارة FAQ
              </Link>
            </div>
            {faqItems.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-black-400">لا توجد أسئلة شائعة متاحة</p>
                <Link
                  href={`/dashboard/books/${book.id}/edit`}
                  className="mt-4 inline-block text-primary-500 hover:text-primary-600 font-medium"
                >
                  إضافة أسئلة شائعة
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-black-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-black-50 transition-colors"
                    >
                      <span className="font-semibold text-black-500 text-right flex-1">
                        {faq.questionAr || faq.question || `سؤال ${index + 1}`}
                      </span>
                      {expandedFaq === index ? (
                        <Minus className="w-5 h-5 text-primary-500 flex-shrink-0 mr-3" />
                      ) : (
                        <Plus className="w-5 h-5 text-primary-500 flex-shrink-0 mr-3" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-black-100">
                        <p className="text-black-600 leading-relaxed text-right">
                          {faq.answerAr || faq.answer || 'لا توجد إجابة متاحة'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments Section */}
          {statistics && statistics.payments && statistics.payments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0 hover-lift" style={{ animationFillMode: 'forwards', animationDelay: '0.35s' }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-primary-500" />
                  <h2 className="text-2xl font-bold text-black-500">
                    المدفوعات ({statistics.payments.length})
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {statistics.payments.slice(0, 10).map((payment, index) => (
                  <div
                    key={payment.id}
                    className="border border-black-100 rounded-xl p-4 hover-lift transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black-500">
                            {payment.user?.nameAr || payment.user?.name || 'مستخدم'}
                          </h4>
                          <p className="text-sm text-black-400">
                            {payment.user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-green-600">
                          {payment.amount.toFixed(2)} ر.س
                        </p>
                        <p className="text-xs text-black-400">
                          {format(new Date(payment.createdAt), 'yyyy-MM-dd', {
                            locale: arSA,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {statistics.payments.length > 10 && (
                  <p className="text-center text-black-400 text-sm">
                    عرض {statistics.payments.length - 10} مدفوعات أخرى
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Readers Section */}
          {statistics && statistics.progressRecords && statistics.progressRecords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0 hover-lift" style={{ animationFillMode: 'forwards', animationDelay: '0.38s' }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary-500" />
                  <h2 className="text-2xl font-bold text-black-500">
                    القراء ({statistics.progressRecords.length})
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {statistics.progressRecords.slice(0, 10).map((progress, index) => (
                  <div
                    key={progress.id}
                    className="border border-black-100 rounded-xl p-4 hover-lift transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black-500">
                            {progress.user?.nameAr || progress.user?.name || 'مستخدم'}
                          </h4>
                          <p className="text-sm text-black-400">
                            {progress.user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-lg font-bold ${
                          progress.percentage >= 100 ? 'text-green-600' :
                          progress.percentage > 0 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {progress.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-black-400">
                          {progress.pagesRead} / {progress.totalPages} صفحة
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-black-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress.percentage >= 100 ? 'bg-green-500' :
                          progress.percentage > 0 ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      ></div>
                    </div>
                    {progress.lastReadAt && (
                      <p className="text-xs text-black-400 mt-2 text-right">
                        آخر قراءة: {format(new Date(progress.lastReadAt), 'yyyy-MM-dd', {
                          locale: arSA,
                        })}
                      </p>
                    )}
                  </div>
                ))}
                {statistics.progressRecords.length > 10 && (
                  <p className="text-center text-black-400 text-sm">
                    عرض {statistics.progressRecords.length - 10} قارئ آخر
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0 hover-lift" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-black-500">
                  تقييمات العملاء
                </h2>
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-black-500">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-black-400">
                    ({reviews.length} تقييم)
                  </span>
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-black-400">لا توجد تقييمات بعد</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="border border-black-100 rounded-xl p-5 hover-lift transition-all duration-300 animate-slide-up opacity-0"
                    style={{ animationFillMode: 'forwards', animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-primary-500 font-bold">{review.user?.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-black-500 mb-1">
                            {review.user?.nameAr || review.user?.name || 'مستخدم'}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 transition-all duration-200 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApproveReview(review.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-all duration-300 hover-scale"
                          >
                            موافقة
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all duration-300 hover-scale"
                        >
                          حذف
                        </button>
                        <span className="text-sm text-black-400">
                          {format(new Date(review.createdAt), 'yyyy-MM-dd', {
                            locale: arSA,
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-black-600 leading-relaxed text-right">
                      {review.commentAr || review.comment || 'لا يوجد تعليق'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics Section */}
          {statistics && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary-500" />
                  <h3 className="text-xl font-bold text-black-500">
                    الإحصائيات والتقارير
                  </h3>
                </div>
                <button
                  onClick={generateReport}
                  className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  تقرير
                </button>
              </div>

              {/* Payment Statistics */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h4 className="text-lg font-bold text-black-500">إحصائيات المدفوعات</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-black-600 font-medium">إجمالي المدفوعات</span>
                    <span className="text-xl font-bold text-green-600">{statistics.statistics.payments.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-black-600 font-medium">إجمالي الإيرادات</span>
                    <span className="text-xl font-bold text-blue-600">
                      {statistics.statistics.payments.revenue.toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-black-600 font-medium">متوسط المبلغ</span>
                    <span className="text-xl font-bold text-purple-600">
                      {statistics.statistics.payments.averageAmount.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* Reader Statistics */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h4 className="text-lg font-bold text-black-500">إحصائيات القراء</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-black-600 font-medium">إجمالي القراء</span>
                    <span className="text-xl font-bold text-blue-600">{statistics.statistics.readers.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-black-600 font-medium">مكتمل القراءة</span>
                    <span className="text-xl font-bold text-green-600">{statistics.statistics.readers.completed}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-black-600 font-medium">قيد القراءة</span>
                    <span className="text-xl font-bold text-yellow-600">{statistics.statistics.readers.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-black-600 font-medium">لم يبدأ</span>
                    <span className="text-xl font-bold text-gray-600">{statistics.statistics.readers.notStarted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <span className="text-black-600 font-medium">متوسط التقدم</span>
                    <span className="text-xl font-bold text-primary-600">
                      {statistics.statistics.readers.averageProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Statistics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h4 className="text-lg font-bold text-black-500">إحصائيات التقييمات</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-black-600 font-medium">إجمالي التقييمات</span>
                    <span className="text-xl font-bold text-yellow-600">{statistics.statistics.reviews.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-black-600 font-medium">متوسط التقييم</span>
                    <span className="text-xl font-bold text-orange-600">
                      {statistics.statistics.reviews.averageRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Book Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold text-black-500 mb-6 pb-4 border-b border-black-100">
              معلومات الكتاب
            </h3>
            <div className="space-y-5">
              {book.author && (
                <div>
                  <p className="text-sm font-semibold text-black-600 mb-1">
                    المؤلف
                  </p>
                  <p className="text-black-500 font-medium">
                    {book.authorAr || book.author}
                  </p>
                  {book.authorAr && book.author && (
                    <p className="text-sm text-black-400 mt-1">
                      {book.author}
                    </p>
                  )}
                </div>
              )}

              {book.isbn && (
                <div>
                  <p className="text-sm font-semibold text-black-600 mb-1">
                    ISBN
                  </p>
                  <p className="text-black-500 font-medium">
                    {book.isbn}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-black-600 mb-1">
                  السعر
                </p>
                <p className="text-3xl font-bold text-primary-500">
                  {parseFloat(book.price).toFixed(2)} ر.س
                </p>
              </div>

              {book.category && (
                <div>
                  <p className="text-sm font-semibold text-black-600 mb-1">
                    المحور
                  </p>
                  <p className="text-black-500 font-medium">
                    {book.categoryAr || book.category}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-black-600 mb-1">
                  المخزون
                </p>
                <p className="text-black-500 font-medium text-lg">
                  {book.stock} نسخة
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-black-600 mb-1">
                  الحالة
                </p>
                <span
                  className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold ${
                    book.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : book.status === 'INACTIVE'
                      ? 'bg-gray-100 text-gray-700'
                      : book.status === 'OUT_OF_STOCK'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-black-100 text-black-700'
                  }`}
                >
                  {book.status === 'ACTIVE' ? 'نشط' :
                   book.status === 'INACTIVE' ? 'غير نشط' :
                   book.status === 'OUT_OF_STOCK' ? 'نفدت' : 'مؤرشف'}
                </span>
              </div>

              {book.createdAt && (
                <div>
                  <p className="text-sm font-semibold text-black-600 mb-1">
                    تاريخ الإنشاء
                  </p>
                  <p className="text-black-500 font-medium">
                    {format(new Date(book.createdAt), 'yyyy-MM-dd', {
                      locale: arSA,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
