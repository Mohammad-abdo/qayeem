'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { booksAPI, bookProgressAPI, paymentsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, Star, TrendingUp, CheckCircle, XCircle, ArrowRight, Percent } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RecommendedBooksPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [purchasedBookIds, setPurchasedBookIds] = useState([])
  const [bookProgress, setBookProgress] = useState({})
  const [filter, setFilter] = useState('all') // all, recommended, not-recommended

  useEffect(() => {
    if (!authLoading && user) {
      fetchRecommendedBooks()
      fetchPurchasedBooks()
      fetchBookProgress()
    }
  }, [user, authLoading])

  const fetchPurchasedBooks = async () => {
    if (!user) {
      setPurchasedBookIds([])
      return
    }
    try {
      const response = await paymentsAPI.getUserPayments()
      const payments = response.data?.payments || []
      const purchasedIds = payments
        .filter(payment => payment.status === 'COMPLETED' && payment.book?.id)
        .map(payment => payment.book.id)
      setPurchasedBookIds(purchasedIds)
    } catch (error) {
      console.error('Error fetching purchased books:', error)
      setPurchasedBookIds([])
    }
  }

  const fetchBookProgress = async () => {
    if (!user) {
      setBookProgress({})
      return
    }
    try {
      console.log('📖 [RECOMMENDED] Fetching book progress for user:', user.id)
      const response = await bookProgressAPI.getMyProgress()
      const currentBooks = response.data?.currentBooks || []
      const previousBooks = response.data?.previousBooks || []
      const allProgress = [...currentBooks, ...previousBooks]
      const progressMap = {}
      
      allProgress.forEach((progressItem) => {
        // Data structure: book object with progress, pagesRead, totalPages directly
        const bookId = progressItem.id // Book ID is directly on the object
        if (bookId) {
          const pagesRead = progressItem.pagesRead || 0
          const totalPages = progressItem.totalPages || 1
          const progress = progressItem.progress || (totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0)
          
          progressMap[bookId] = {
            progress,
            pagesRead,
            totalPages,
          }
          console.log(`  ✅ [RECOMMENDED] Book ${bookId}: ${progress}% (${pagesRead}/${totalPages} pages)`)
        }
      })
      
      console.log('✅ [RECOMMENDED] Book progress loaded:', Object.keys(progressMap).length, 'books')
      setBookProgress(progressMap)
    } catch (error) {
      console.error('❌ [RECOMMENDED] Error fetching book progress:', error)
      console.error('Error details:', error.response?.data || error.message)
      setBookProgress({})
    }
  }

  const fetchRecommendedBooks = async () => {
    try {
      setLoading(true)
      console.log('📚 Fetching recommended books...')
      const response = await booksAPI.getRecommended()
      const allBooks = response.data.books || []
      console.log('📚 Received books:', allBooks.length)
      console.log('📚 Recommended books:', allBooks.filter(b => b.isRecommended).length)
      console.log('📚 Books details:', allBooks.map(b => ({
        id: b.id,
        title: b.titleAr || b.title,
        isRecommended: b.isRecommended,
        matchPercentage: b.matchPercentage,
        evaluationResults: b.evaluationResults?.length || 0
      })))
      setBooks(allBooks)
    } catch (error) {
      console.error('❌ Error fetching recommended books:', error)
      console.error('Error details:', error.response?.data || error.message)
      toast.error('فشل تحميل الكتب الموصى بها')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  // Filter: Show only recommended books, exclude those with completed achievements
  const filteredBooks = books.filter((book) => {
    // Only show recommended books
    if (!book.isRecommended) return false
    
    // Exclude books with completed achievements
    const progressData = bookProgress[book.id]
    const hasAchievement = progressData && progressData.progress >= 100
    if (hasAchievement) return false
    
    // Apply additional filter if needed
    if (filter === 'recommended') return book.isRecommended
    if (filter === 'not-recommended') return !book.isRecommended
    return true
  })

  const recommendedCount = books.filter((b) => b.isRecommended).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg" dir="rtl">
        <Header currentPage="/recommended" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-black-600">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <Header currentPage="/recommended" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black-500 mb-2">
            الكتب الموصى بها
          </h1>
          <p className="text-black-600">
            بناءً على نتائج التقييمات التي قمت بها
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-500 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-black-600 mb-1">إجمالي الكتب</p>
            <p className="text-3xl font-bold text-black-500">{books.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-black-600 mb-1">موصى بها</p>
            <p className="text-3xl font-bold text-green-600">{recommendedCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-black-600 mb-1">متوسط النسبة</p>
            <p className="text-3xl font-bold text-orange-600">
              {books.length > 0
                ? Math.round(
                    books.reduce((sum, b) => sum + (b.matchPercentage || 0), 0) / books.length
                  )
                : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-black-500 border border-black-100 hover:bg-gray-50'
            }`}
          >
            الكل ({books.length})
          </button>
          <button
            onClick={() => setFilter('recommended')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'recommended'
                ? 'bg-green-500 text-white'
                : 'bg-white text-black-500 border border-black-100 hover:bg-gray-50'
            }`}
          >
            موصى بها ({recommendedCount})
          </button>
          <button
            onClick={() => setFilter('not-recommended')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'not-recommended'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-black-500 border border-black-100 hover:bg-gray-50'
            }`}
          >
            غير موصى بها ({books.length - recommendedCount})
          </button>
        </div>

        {/* Books List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-black-100">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-bold text-black-500 mb-2">لا توجد كتب</p>
            <p className="text-black-600">
              {filter === 'recommended'
                ? 'لا توجد كتب موصى بها حالياً. قم بإكمال التقييمات المرتبطة بالكتب.'
                : 'لا توجد كتب متاحة.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const isPurchased = purchasedBookIds.includes(book.id)
              const progressData = bookProgress[book.id]
              
              return (
              <div
                key={book.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border-4 transition-all hover:shadow-xl hover:-translate-y-1 ${
                  // Green border for books with 70% or higher match percentage (meetsThreshold)
                  book.meetsThreshold || (book.matchPercentage || 0) >= 70
                    ? 'border-green-500'
                    : isPurchased
                    ? 'border-green-400'
                    : 'border-blue-400'
                }`}
              >
                {/* Book Cover */}
                <div className="relative h-64 bg-gray-100">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/object.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    موصى به
                  </div>
                  {isPurchased && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      مشترى
                    </div>
                  )}
                  <div className={`absolute ${isPurchased ? 'bottom-2 right-2' : 'top-2 right-2'} bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                    <Percent className="w-4 h-4 text-primary-500" />
                    <span className="text-primary-600">{book.matchPercentage?.toFixed(1) || 0}%</span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black-500 mb-2 line-clamp-2">
                    {book.titleAr || book.title}
                  </h3>
                  {book.authorAr || book.author ? (
                    <p className="text-sm text-black-600 mb-4">
                      {book.authorAr || book.author}
                    </p>
                  ) : null}

                  {/* Evaluation Results */}
                  {book.evaluationResults && book.evaluationResults.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-semibold text-black-500 mb-2">
                        نتائج التقييمات ({book.completedEvaluations}/{book.totalEvaluations}):
                      </p>
                      {book.evaluationResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                        >
                          <span className="text-black-600 truncate flex-1">
                            {result.evaluationTitleAr || result.evaluationTitle}
                          </span>
                          <div className="flex items-center gap-2 ml-2">
                            <span
                              className={`font-bold ${
                                result.isPassed ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {result.userScore.toFixed(1)}%
                            </span>
                            {result.isPassed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Match Percentage Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-black-600">نسبة التطابق</span>
                      <span className="font-bold text-black-500">
                        {book.matchPercentage?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          book.isRecommended
                            ? 'bg-green-500'
                            : book.matchPercentage >= 50
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(book.matchPercentage || 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Reading Progress */}
                  {progressData && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-black-600">
                          {progressData.pagesRead || 0} / {progressData.totalPages || 0} صفحة
                        </span>
                        <span className={`font-semibold ${(progressData.progress || 0) >= 100 ? 'text-green-600' : 'text-primary-500'}`}>
                          {progressData.progress || 0}% مكتمل
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (progressData.progress || 0) >= 100 ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(progressData.progress || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Price with Discount */}
                  {book.hasDiscount && book.discountedPrice ? (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-green-600">
                          {book.discountedPrice.toFixed(2)} ر.س
                        </span>
                        {book.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {book.originalPrice.toFixed(2)} ر.س
                          </span>
                        )}
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                          خصم {book.discountPercentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-lg font-bold text-black-500">
                        {parseFloat(book.price || 0).toFixed(2)} ر.س
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/library/${book.id}`}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      عرض التفاصيل
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
