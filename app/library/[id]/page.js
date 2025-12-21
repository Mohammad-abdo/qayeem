'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { booksAPI, bookReviewsAPI, bookProgressAPI, paymentsAPI } from '@/lib/api'
import { getBookTitle, getBookDescription, getBookAuthor, getBookCategory } from '@/lib/translations'
import toast from 'react-hot-toast'
import { BookOpen, Star, ArrowRight, ShoppingCart, Edit, Plus, Minus, MessageSquare, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BookDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState({
    pagesRead: 0,
    readingDays: 0,
  })
  const [editProgress, setEditProgress] = useState({
    pagesRead: 0,
    readingDays: 0,
  })
  const [showEditProgress, setShowEditProgress] = useState(false)
  const [savingProgress, setSavingProgress] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    commentAr: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [recommendedBook, setRecommendedBook] = useState(null)

  useEffect(() => {
    if (params.id) {
      fetchBook()
      fetchReviews()
      if (user) {
        checkPurchaseStatus()
        fetchRecommendedBook()
      }
    }
  }, [params.id, user])

  const checkPurchaseStatus = async () => {
    if (!user) {
      setIsPurchased(false)
      return
    }
    try {
      const response = await paymentsAPI.getUserPayments()
      const payments = response.data?.payments || []
      const purchased = payments.some(
        payment => payment.bookId === parseInt(params.id) && payment.status === 'COMPLETED'
      )
      setIsPurchased(purchased)
    } catch (error) {
      console.error('Error checking purchase status:', error)
      setIsPurchased(false)
    }
  }

  const fetchRecommendedBook = async () => {
    if (!user) {
      setRecommendedBook(null)
      return
    }
    try {
      const response = await booksAPI.getRecommended()
      const recommendedBooks = response.data.books || []
      const bookData = recommendedBooks.find(b => b.id === parseInt(params.id) && b.isRecommended)
      setRecommendedBook(bookData || null)
    } catch (error) {
      console.error('Error fetching recommended book:', error)
      setRecommendedBook(null)
    }
  }

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getById(params.id)
      setBook(response.data.book)
      // Fetch reading progress if user is logged in
      if (user) {
        try {
          const progressRes = await bookProgressAPI.getBookProgress(params.id)
          const progress = progressRes.data.progress
          if (progress) {
            const progressData = {
              pagesRead: progress.pagesRead || 0,
              readingDays: progress.readingDays || 0,
            }
            setReadingProgress(progressData)
            setEditProgress(progressData)
          }
        } catch (error) {
          // Progress not found is okay - user hasn't started reading yet
          console.log('No progress found for this book')
          setReadingProgress({ pagesRead: 0, readingDays: 0 })
          setEditProgress({ pagesRead: 0, readingDays: 0 })
        }
      }
    } catch (error) {
      toast.error(t('common.error'))
      router.push('/library')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyBook = () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must login first')
      router.push('/login')
      return
    }
    // Navigate to payment/checkout
    router.push(`/library/${params.id}/checkout`)
  }

  const handleSaveProgress = async () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must login first')
      return
    }

    try {
      setSavingProgress(true)
      await bookProgressAPI.updateProgress({
        bookId: parseInt(params.id),
        pagesRead: editProgress.pagesRead,
      })
      
      setReadingProgress(editProgress)
      setShowEditProgress(false)
      toast.success(language === 'ar' ? 'تم حفظ التقدم بنجاح' : 'Progress saved successfully')
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل حفظ التقدم' : 'Failed to save progress')
    } finally {
      setSavingProgress(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      const response = await bookReviewsAPI.getAll({
        bookId: parseInt(params.id),
        isApproved: true, // Only show approved reviews
        limit: 50,
      })
      const reviewsData = response.data.reviews || []
      setReviews(reviewsData)
      
      // Calculate average rating
      if (reviewsData.length > 0) {
        const total = reviewsData.reduce((sum, review) => sum + review.rating, 0)
        setAverageRating(total / reviewsData.length)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      // Don't show error toast - reviews are optional
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must login first')
      router.push('/login')
      return
    }

    if (!reviewForm.comment.trim() && !reviewForm.commentAr.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال تعليق' : 'Please enter a comment')
      return
    }

    try {
      setSubmittingReview(true)
      await bookReviewsAPI.create({
        bookId: parseInt(params.id),
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
        commentAr: reviewForm.commentAr || undefined,
      })
      toast.success(language === 'ar' ? 'تم إرسال المراجعة بنجاح! ستعرض بعد الموافقة عليها' : 'Review submitted successfully! It will be displayed after approval')
      setReviewForm({ rating: 5, comment: '', commentAr: '' })
      setShowReviewForm(false)
      fetchReviews() // Refresh reviews
    } catch (error) {
      toast.error(error.response?.data?.error || (language === 'ar' ? 'فشل إرسال المراجعة' : 'Failed to submit review'))
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  const totalPages = book?.totalPages || 300 // This should come from book data
  const totalDays = 10
  const pagesProgress = totalPages > 0 ? (readingProgress.pagesRead / totalPages) * 100 : 0
  const daysProgress = (readingProgress.readingDays / totalDays) * 100

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header currentPage="/library" />
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20 lg:h-24"></div>

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-4 px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/library" className="text-black-600 hover:text-primary-500">
            {t('library.title')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <span className="text-black-500">{t('home.suggestedBooks.bookDetails')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Book Details - Left Side (RTL: visual right) */}
          <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={getBookTitle(book, language)}
                className="w-full h-[80%] object-cover rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 hover-scale"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/object.png';
                }}
              />
            ) : (
              <div className="w-full h-[600px] bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center hover-lift">
                <BookOpen className="w-32 h-32 text-primary-500" />
              </div>
            )}
          </div>
          {/* Book Cover - Right Side (RTL: visual left) */}
          <div className="space-y-6 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <div>
              <h1 className={`text-4xl font-bold text-black-500 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} ({reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                {(() => {
                  const originalPrice = parseFloat(book.price) || 0
                  const bookDiscount = book.discountPercentage ? parseFloat(book.discountPercentage) : 0
                  const recommendedDiscount = recommendedBook?.hasDiscount ? recommendedBook.discountPercentage : 0
                  
                  // Use book discount if exists, otherwise use recommended discount
                  const activeDiscount = bookDiscount > 0 ? bookDiscount : recommendedDiscount
                  const hasDiscount = activeDiscount > 0
                  
                  if (hasDiscount) {
                    const discountAmount = (originalPrice * activeDiscount) / 100
                    const finalPrice = originalPrice - discountAmount
                    return (
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl font-bold text-green-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {finalPrice.toFixed(2)} ر.س
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {originalPrice.toFixed(2)} ر.س
                        </span>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded">
                          خصم {activeDiscount}%
                        </span>
                      </div>
                    )
                  } else {
                    return (
                      <span className={`text-3xl font-bold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {originalPrice.toFixed(2)} ر.س
                      </span>
                    )
                  }
                })()}
              </div>
            </div>

            {/* Summary */}
            <div className="hover-lift bg-white rounded-lg p-4 border border-black-100">
              <h2 className={`text-xl font-bold text-black-500 mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'ملخص' : 'Summary'}</h2>
              <p className={`text-black-600 leading-relaxed text-base ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {getBookDescription(book, language) || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover-lift transition-all duration-300">
              <p className={`text-black-600 mb-2 text-base ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'ننصح بإجراء التقييم قبل الشراء لتأكيد أن هذا الكتاب مناسب لك.' : 'We recommend taking the evaluation before purchasing to confirm this book is suitable for you.'}{' '}
                <Link
                  href="/evaluation"
                  className="text-primary-500 hover:text-primary-400 underline font-semibold transition-colors duration-300"
                >
                  {language === 'ar' ? 'اجراء التقييم' : 'Take Evaluation'}
                </Link>
              </p>
            </div>


            {/* Reading Progress Section - Only show if user is logged in */}
            {user && (
              <div className="bg-white rounded-lg p-6 border border-black-100 hover-lift transition-all duration-300 mt-6">
                <h2 className={`text-xl font-bold text-black-500 mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'تابع تطورك في القراءة' : 'Follow Your Reading Progress'}
                </h2>

                {!showEditProgress ? (
                  <>
                    {/* Pages Read Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'الصفحات المقروءة' : 'Pages Read'}
                        </span>
                        <span className="text-sm font-bold text-primary-500">
                          {readingProgress.pagesRead} / {totalPages}
                        </span>
                      </div>
                      <div className="w-full bg-black-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(pagesProgress, 100)}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {pagesProgress.toFixed(0)}%
                      </div>
                    </div>

                    {/* Days Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'عدد الأيام' : 'Number of Days'}
                        </span>
                        <span className="text-sm font-bold text-primary-500">
                          {readingProgress.readingDays} / {totalDays}
                        </span>
                      </div>
                      <div className="w-full bg-black-100 rounded-full h-3 mb-2">
                        <div
                          className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(daysProgress, 100)}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {daysProgress.toFixed(0)}%
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditProgress({ ...readingProgress })
                        setShowEditProgress(true)
                      }}
                      className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all duration-300 hover-scale flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {language === 'ar' ? 'تعديل التقدم' : 'Edit Progress'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Edit Progress Form */}
                    <div className="space-y-4">
                      {/* Pages Read Input */}
                      <div>
                        <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'الصفحات المقروءة' : 'Pages Read'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={totalPages}
                          value={editProgress.pagesRead}
                          onChange={(e) => setEditProgress({ ...editProgress, pagesRead: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                          placeholder={language === 'ar' ? `${totalPages} صفحة` : `${totalPages} pages`}
                        />
                      </div>

                      {/* Reading Days Input */}
                      <div>
                        <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' ? 'عدد أيام القراءة' : 'Number of Reading Days'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editProgress.readingDays}
                          onChange={(e) => setEditProgress({ ...editProgress, readingDays: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                          placeholder={language === 'ar' ? `${totalDays} أيام` : `${totalDays} days`}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveProgress}
                          disabled={savingProgress}
                          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all duration-300 hover-scale disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {savingProgress ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                            </>
                          ) : (
                            <>
                              {language === 'ar' ? 'حفظ التعديل' : 'Save Changes'}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditProgress({ ...readingProgress })
                            setShowEditProgress(false)
                          }}
                          className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 transition-all duration-300"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Buy Button - Only show if not purchased */}
            {!isPurchased && (
              <button
                onClick={handleBuyBook}
                className="w-full px-6 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-400 flex items-center justify-center gap-2 mt-6 transition-all duration-300 hover-scale hover-glow"
              >
                <ShoppingCart className="w-5 h-5" />
                {language === 'ar' ? 'شراء الكتاب' : 'Buy Book'}
              </button>
            )}
            {isPurchased && (
              <div className="w-full px-6 py-4 bg-green-500 text-white text-lg font-bold rounded-lg flex items-center justify-center gap-2 mt-6">
                <CheckCircle className="w-5 h-5" />
                {language === 'ar' ? 'تم الشراء' : 'Purchased'}
              </div>
            )}
          </div>
    
        </div>

        {/* Reviews Section */}
        <div className="mt-12 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-black-100 hover-lift">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary-500" />
                <h2 className={`text-2xl font-bold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'تقييمات العملاء' : 'Client Reviews'}
                </h2>
              </div>
              {user && !reviews.some(r => r.userId === user.id) && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all duration-300 hover-scale flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة تقييم' : 'Add Review'}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && (
              <div className="mb-6 p-6 bg-primary-50 rounded-lg border border-primary-200 animate-slide-down">
                <h3 className={`text-xl font-bold text-black-500 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'اكتب تقييمك' : 'Write Your Review'}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'التقييم' : 'Rating'}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none transition-transform duration-200 hover-scale"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewForm.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Arabic */}
                  <div>
                    <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'التعليق (عربي)' : 'Comment (Arabic)'}
                    </label>
                    <textarea
                      value={reviewForm.commentAr}
                      onChange={(e) => setReviewForm({ ...reviewForm, commentAr: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      placeholder={language === 'ar' ? 'اكتب تعليقك بالعربي...' : 'Write your comment in Arabic...'}
                      dir="rtl"
                    />
                  </div>

                  {/* Comment English */}
                  <div>
                    <label className={`block text-sm font-medium text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'التعليق (إنجليزي)' : 'Comment (English)'}
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      placeholder={language === 'ar' ? 'Write your comment in English...' : 'Write your comment in English...'}
                      dir="ltr"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all duration-300 hover-scale disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          {language === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false)
                        setReviewForm({ rating: 5, comment: '', commentAr: '' })
                      }}
                      className="px-6 py-3 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 transition-all duration-300"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-black-400">{language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all duration-300 hover-scale"
                  >
                    {language === 'ar' ? 'كن أول من يقيم' : 'Be the first to review'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="border border-black-100 rounded-xl p-5 hover-lift transition-all duration-300 animate-slide-up opacity-0"
                    style={{ animationFillMode: 'forwards', animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-bold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? (review.user?.nameAr || review.user?.name) : (review.user?.name || review.user?.nameAr) || (language === 'ar' ? 'مستخدم' : 'User')}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm text-black-400 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                    <p className={`text-black-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (review.commentAr || review.comment) : (review.comment || review.commentAr) || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
          <div className="flex gap-4 border-b border-black-100 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-black-600 hover:text-primary-500'
              }`}
            >
              {language === 'ar' ? 'التفاصيل' : 'Details'}
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'delivery'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-black-600 hover:text-primary-500'
              }`}
            >
              {language === 'ar' ? 'تفاصيل التوصيل' : 'Delivery Details'}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'shipping'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-black-600 hover:text-primary-500'
              }`}
            >
              {language === 'ar' ? 'الشحن' : 'Shipping'}
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 border border-black-100 hover-lift transition-all duration-300">
            {activeTab === 'details' && (
              <div className="animate-fade-in">
                <p className={`text-black-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {getBookDescription(book, language) || (language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available')}
                </p>
              </div>
            )}
            {activeTab === 'delivery' && (
              <div className="animate-fade-in">
                <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'تفاصيل التوصيل ستكون متاحة قريباً' : 'Delivery details will be available soon'}</p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="animate-fade-in">
                <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'معلومات الشحن ستكون متاحة قريباً' : 'Shipping information will be available soon'}</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
          <h2 className={`text-2xl font-bold text-black-500 mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
          <div className="space-y-4">
            {book?.faq && Array.isArray(book.faq) && book.faq.length > 0 ? (
              book.faq.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-black-100 overflow-hidden hover-lift transition-all duration-300 animate-slide-up opacity-0"
                  style={{ animationFillMode: 'forwards', animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className={`w-full px-6 py-4 flex items-center ${language === 'ar' ? 'justify-between' : 'justify-between'} hover:bg-primary-50 transition-all duration-300`}
                  >
                    <span className={`font-semibold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (faq.questionAr || faq.question) : (faq.question || faq.questionAr) || (language === 'ar' ? 'سؤال؟' : 'Question?')}
                    </span>
                    <div className="transition-transform duration-300" style={{ transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      {expandedFaq === index ? (
                        <Minus className="w-5 h-5 text-primary-500" />
                      ) : (
                        <Plus className="w-5 h-5 text-primary-500" />
                      )}
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 border-t border-black-100 bg-primary-50 animate-slide-down">
                      <p className={`text-black-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? (faq.answerAr || faq.answer) : (faq.answer || faq.answerAr) || ''}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'لا توجد أسئلة شائعة متاحة' : 'No FAQs available'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}


         