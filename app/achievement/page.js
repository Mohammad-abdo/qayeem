'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { bookProgressAPI, booksAPI, paymentsAPI } from '@/lib/api'
import { getBookTitle, getBookCategory } from '@/lib/translations'
import toast from 'react-hot-toast'
import { BookOpen, Calendar, Star, Filter, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AchievementPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  
  // Stats
  const [stats, setStats] = useState({
    pagesRead: 0,
    booksRead: 0,
    readingDays: 0,
  })
  
  // Books
  const [currentBooks, setCurrentBooks] = useState([])
  const [previousBooks, setPreviousBooks] = useState([])
  const [recommendedBookIds, setRecommendedBookIds] = useState([])
  const [purchasedBookIds, setPurchasedBookIds] = useState([])
  const [purchasedBooksLoaded, setPurchasedBooksLoaded] = useState(false)
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    axis: '',
    element: '',
    dateFrom: '',
    dateTo: '',
    rating: 0,
  })
  
  // Pagination
  const [showMore, setShowMore] = useState(false)
  const displayedPreviousBooks = showMore ? previousBooks : previousBooks.slice(0, 12)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }
    
    fetchData()
    fetchRecommendedBooks()
    fetchPurchasedBooks()
  }, [user, authLoading])

  const fetchRecommendedBooks = async () => {
    if (!user) {
      setRecommendedBookIds([])
      return
    }
    try {
      const response = await booksAPI.getRecommended()
      const recommendedBooks = response.data.books || []
      const recommendedIds = recommendedBooks
        .filter(book => book.isRecommended)
        .map(book => book.id)
      setRecommendedBookIds(recommendedIds)
    } catch (error) {
      console.error('Error fetching recommended books:', error)
      setRecommendedBookIds([])
    }
  }

  const fetchPurchasedBooks = async () => {
    if (!user) {
      setPurchasedBookIds([])
      return
    }
    try {
      console.log('💰 [ACHIEVEMENT] Fetching purchased books for user:', user.id)
      // Fetch all payments without pagination limit
      const response = await paymentsAPI.getUserPayments({ limit: '1000', page: '1' })
      const payments = response.data?.payments || []
      console.log('💰 [ACHIEVEMENT] Total payments found:', payments.length)
      
      const purchasedIds = payments
        .filter(payment => {
          const isCompleted = payment.status === 'COMPLETED'
          const hasBook = payment.bookId && payment.book?.id
          if (isCompleted && hasBook) {
            console.log('✅ [ACHIEVEMENT] Found purchased book:', payment.book.id, payment.book.titleAr || payment.book.title)
          }
          return isCompleted && hasBook
        })
        .map(payment => payment.book.id)
      
      console.log('✅ [ACHIEVEMENT] Purchased book IDs:', purchasedIds)
      setPurchasedBookIds(purchasedIds)
      setPurchasedBooksLoaded(true)
    } catch (error) {
      console.error('❌ [ACHIEVEMENT] Error fetching purchased books:', error)
      console.error('Error details:', error.response?.data || error.message)
      setPurchasedBookIds([])
      setPurchasedBooksLoaded(true) // Mark as loaded even on error
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch progress data
      const progressResponse = await bookProgressAPI.getMyProgress()
      const progressData = progressResponse.data || {}
      
      setStats(progressData.stats || { pagesRead: 0, booksRead: 0, readingDays: 0 })
      
      // Create a map of progress data by book ID
      const progressMap = {}
      const allProgressBooks = [
        ...(progressData.currentBooks || []),
        ...(progressData.previousBooks || [])
      ]
      
      allProgressBooks.forEach(book => {
        if (book.id) {
          progressMap[book.id] = {
            progress: book.progress || 0,
            pagesRead: book.pagesRead || 0,
            totalPages: book.totalPages || 0,
            startDate: book.startDate,
            lastReadAt: book.lastReadAt,
            completedAt: book.completedAt,
          }
        }
      })
      
      // Fetch all purchased books
      const paymentsResponse = await paymentsAPI.getUserPayments({ limit: '1000', page: '1' })
      const purchasedPayments = paymentsResponse.data?.payments || []
      const purchasedIds = purchasedPayments
        .filter(payment => payment.status === 'COMPLETED' && payment.book)
        .map(payment => payment.book.id)
      
      // Fetch all purchased books details
      if (purchasedIds.length > 0) {
        const booksResponse = await booksAPI.getAll({ limit: '1000', page: '1' })
        const allBooks = booksResponse.data?.books || []
        
        // Filter to only purchased books and merge with progress data
        const purchasedBooks = allBooks
          .filter(book => purchasedIds.includes(book.id))
          .map(book => ({
            ...book,
            progress: progressMap[book.id]?.progress || 0,
            pagesRead: progressMap[book.id]?.pagesRead || 0,
            totalPages: progressMap[book.id]?.totalPages || book.totalPages || 0,
            startDate: progressMap[book.id]?.startDate,
            lastReadAt: progressMap[book.id]?.lastReadAt,
            completedAt: progressMap[book.id]?.completedAt,
          }))
        
        // Separate current (in-progress) and previous (completed) books
        const current = purchasedBooks.filter(book => (book.progress || 0) < 100)
        const previous = purchasedBooks.filter(book => (book.progress || 0) >= 100)
        
        setCurrentBooks(current)
        setPreviousBooks(previous)
      } else {
        setCurrentBooks([])
        setPreviousBooks([])
      }
    } catch (error) {
      console.error('Error fetching achievement data:', error)
      toast.error(t('achievement.fetchError'))
      // Set empty state on error
      setStats({ pagesRead: 0, booksRead: 0, readingDays: 0 })
      setCurrentBooks([])
      setPreviousBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      axis: '',
      element: '',
      dateFrom: '',
      dateTo: '',
      rating: 0,
    })
  }

  // Filter books based on selected filters
  // Note: currentBooks and previousBooks already contain only purchased books from fetchData
  const getFilteredBooks = (books, requireCompleted = false) => {
    console.log('🔍 [ACHIEVEMENT] Filtering books:', {
      totalBooks: books.length,
      requireCompleted,
      filters
    })
    
    const filtered = books.filter(book => {
      // Ensure book has an id
      if (!book.id) {
        console.log('⚠️ [ACHIEVEMENT] Book missing ID:', book)
        return false
      }
      
      // For "Previous Achievements" section, only show completed books (progress >= 100%)
      // For "Current Reading Journey" section, show all purchased books
      if (requireCompleted) {
        const progress = book.progress || 0
        console.log(`📊 [ACHIEVEMENT] Book ${book.id} (${book.titleAr || book.title}): progress=${progress}%`)
        if (progress < 100) {
          console.log(`❌ [ACHIEVEMENT] Book ${book.id} not completed (${progress}% < 100%)`)
          return false
        }
      }
      
      // Apply other filters
      if (filters.axis && getBookCategory(book, language) !== filters.axis) return false
      if (filters.element && getBookCategory(book, language) !== filters.element) return false
      if (filters.dateFrom && book.startDate && new Date(book.startDate) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && book.startDate && new Date(book.startDate) > new Date(filters.dateTo)) return false
      // Rating filter would need actual rating data
      
      console.log(`✅ [ACHIEVEMENT] Book ${book.id} passed all filters`)
      return true
    })
    
    console.log(`✅ [ACHIEVEMENT] Filtered books: ${filtered.length} out of ${books.length}`)
    return filtered
  }

  // Current books: show all purchased books (completed or in-progress)
  const filteredCurrentBooks = getFilteredBooks(currentBooks, false)
  // Previous books: show only completed purchased books (progress >= 100%)
  const filteredPreviousBooks = getFilteredBooks(previousBooks, true)
  const displayedFilteredPrevious = showMore ? filteredPreviousBooks : filteredPreviousBooks.slice(0, 12)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-black-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user is behind schedule (progress < 50% on any current book)
  const isBehindSchedule = filteredCurrentBooks.some(book => (book.progress || 0) < 50)

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="/achievement" />
      <div className="h-16 sm:h-20 lg:h-24"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Main Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 mb-3 sm:mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' 
              ? 'تابع تقدمك في القراءة، والكتب الجاري قراءتها!'
              : 'Track your reading progress and current books!'}
          </h1>
          <p className={`text-black-600 text-sm sm:text-base lg:text-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar'
              ? 'اختر المجال الذي يهمك الآن، وأجب على مجموعة من الأسئلة المصممة خصيصا لك. ودا هيساعدك تقرأ كتب تناسبك أكثر.'
              : 'Choose the field that interests you now, and answer a set of questions designed specifically for you. This will help you read books that suit you better.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Stats Cards - Order matches image: Pages (right), Books (middle), Days (left) */}
            <div className={`grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 ${language === 'ar' ? '' : ''}`}>
              <div className={`bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-black-100 hover-lift transition-all ${language === 'ar' ? 'order-3' : 'order-1'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-500" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black-500 mb-1 sm:mb-2">{stats.pagesRead}</p>
                <p className="text-xs sm:text-sm text-black-600">{language === 'ar' ? 'صفحة مقروءة' : 'Pages Read'}</p>
              </div>

              <div className={`bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-black-100 hover-lift transition-all order-2`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-500" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black-500 mb-1 sm:mb-2">{stats.booksRead}</p>
                <p className="text-xs sm:text-sm text-black-600">{language === 'ar' ? 'كتب مقروءة' : 'Books Read'}</p>
              </div>

              <div className={`bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-black-100 hover-lift transition-all ${language === 'ar' ? 'order-1' : 'order-3'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-500" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black-500 mb-1 sm:mb-2">{stats.readingDays}</p>
                <p className="text-xs sm:text-sm text-black-600">{language === 'ar' ? 'عدد أيام القراءة' : 'Reading Days'}</p>
              </div>
            </div>

            {/* Current Reading Journey */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'رحلتك الحالية في القراءة' : 'Your Current Reading Journey'}
              </h2>
              <p className={`text-sm sm:text-base text-black-600 mb-4 sm:mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اتبع خطة القراءة المقترحة' : 'Follow the suggested reading plan'}
              </p>

              {/* Axis Tags */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg text-xs sm:text-sm font-semibold">
                  {language === 'ar' ? 'محور الصحة البدنية' : 'Physical Health Axis'}
                </span>
              </div>

              {/* Current Books - Horizontal Scrollable */}
              {filteredCurrentBooks.length > 0 ? (
                <>
                  <div className="overflow-x-auto mb-4 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                    <div className="flex gap-3 sm:gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                      {filteredCurrentBooks.slice(0, 4).map((book) => {
                        const progress = book.progress || 0
                        const completed = progress >= 100
                        
                        return (
                          <Link
                            key={book.id}
                            href={`/library/${book.id}`}
                            className={`flex-shrink-0 w-48 sm:w-56 lg:w-64 bg-white rounded-lg shadow-md overflow-hidden border-2 sm:border-4 hover:shadow-xl transition-all duration-300 hover-lift ${
                              completed ? 'border-green-500' : 'border-black-100'
                            }`}
                          >
                            {book.coverImage ? (
                              <div className="h-36 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={book.coverImage}
                                  alt={getBookTitle(book, language)}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/object.png';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-36 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                                <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-500 opacity-50" />
                              </div>
                            )}
                            <div className="p-3 sm:p-4">
                              <div className="mb-2">
                                <span className="text-xs text-primary-500 font-semibold">
                                  {getBookCategory(book, language) || (language === 'ar' ? 'ممارسات' : 'Practices')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-black-500">4.8</span>
                              </div>
                              <h3 className={`text-sm font-bold text-black-500 mb-2 line-clamp-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Name')}
                              </h3>
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                    {Math.round(progress)}% {language === 'ar' ? 'مكتمل' : 'complete'}
                                  </span>
                                </div>
                                <div className="w-full bg-black-100 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      completed ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <p className={`text-xs text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {language === 'ar' ? 'القراءة في 7 أيام' : 'Reading in 7 days'}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Progress Bar with dots */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1">
                      {filteredCurrentBooks.slice(0, 4).map((book, index) => {
                        const progress = book.progress || 0
                        const completed = progress >= 100
                        return (
                          <div key={book.id} className="flex-1 flex items-center">
                            <div className={`flex-1 h-1.5 rounded-full ${
                              completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            {index < filteredCurrentBooks.length - 1 && (
                              <div className={`w-2 h-2 rounded-full mx-0.5 ${
                                completed ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-black-100">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-black-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-black-600">{language === 'ar' ? 'لا توجد كتب جاري قراءتها' : 'No books currently being read'}</p>
                </div>
              )}

              {/* Warning Message */}
              {isBehindSchedule && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className={`text-red-700 text-xs sm:text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar'
                      ? 'لاحظنا إنك متأخر عن خطتك، حاول تخصص وقت قصير يوميا للقراءة'
                      : 'We noticed you are behind your schedule, try to dedicate a short time daily for reading'}
                  </p>
                </div>
              )}
            </div>

            {/* Previous Achievements */}
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold text-black-500 mb-4 sm:mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الانجازات السابق' : 'Previous Achievements'}
              </h2>

              {displayedFilteredPrevious.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {displayedFilteredPrevious.map((book) => {
                      const progress = book.progress || 0
                      const completed = progress >= 100
                      const isRecommended = recommendedBookIds.includes(book.id)
                      
                      return (
                        <Link
                          key={book.id}
                          href={`/library/${book.id}`}
                          className={`bg-white rounded-lg shadow-md overflow-hidden border-2 sm:border-4 hover:shadow-xl transition-all duration-300 hover-lift relative ${
                              isRecommended ? 'border-purple-500' : 'border-green-500'
                            }`}
                        >
                          {isRecommended && (
                            <div className="absolute top-2 left-2 z-20 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                              <CheckCircle className="w-3 h-3" />
                              {language === 'ar' ? 'موصى به' : 'Recommended'}
                            </div>
                          )}
                          {book.coverImage ? (
                            <div className="h-36 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
                              <img
                                src={book.coverImage}
                                alt={getBookTitle(book, language)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-36 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-500 opacity-50" />
                            </div>
                          )}
                          <div className="p-3 sm:p-4">
                            <div className="mb-2">
                              <span className="text-xs text-primary-500 font-semibold">
                                {getBookCategory(book, language) || (language === 'ar' ? 'ممارسات' : 'Practices')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-black-500">4.8</span>
                            </div>
                            <h3 className={`text-sm font-bold text-black-500 mb-2 line-clamp-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Name')}
                            </h3>
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  {Math.round(progress)}% {language === 'ar' ? 'مكتمل' : 'complete'}
                                </span>
                              </div>
                              <div className="w-full bg-black-100 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    completed ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <p className={`text-xs text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {language === 'ar' ? 'القراءة في 7 أيام' : 'Reading in 7 days'}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {filteredPreviousBooks.length > 12 && (
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all hover-scale"
                      >
                        {showMore 
                          ? (language === 'ar' ? 'عرض أقل' : 'Show Less')
                          : (language === 'ar' ? 'عرض المزيد' : 'Show More')
                        }
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-black-100">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-black-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-black-600">{language === 'ar' ? 'لا توجد إنجازات سابقة' : 'No previous achievements'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-black-100 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-bold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'التصفية' : 'Filter'}
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-black-600 hover:text-black-500 p-2"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-3 sm:space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Axis Filter */}
                <div>
                  <label className={`block text-sm font-semibold text-black-600 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'المحور' : 'Axis'}
                  </label>
                  <select
                    value={filters.axis}
                    onChange={(e) => handleFilterChange('axis', e.target.value)}
                    className="w-full px-4 py-2 border border-black-200 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="">{language === 'ar' ? 'الصحة البدنية' : 'Physical Health'}</option>
                    <option value="mental">{language === 'ar' ? 'الصحة النفسية' : 'Mental Health'}</option>
                    <option value="social">{language === 'ar' ? 'الصحة الاجتماعية' : 'Social Health'}</option>
                  </select>
                </div>

                {/* Element Filter */}
                <div>
                  <label className={`block text-sm font-semibold text-black-600 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'العنصر' : 'Element'}
                  </label>
                  <select
                    value={filters.element}
                    onChange={(e) => handleFilterChange('element', e.target.value)}
                    className="w-full px-4 py-2 border border-black-200 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="">{language === 'ar' ? 'ممارسات' : 'Practices'}</option>
                    <option value="patterns">{language === 'ar' ? 'أنماط' : 'Patterns'}</option>
                    <option value="skills">{language === 'ar' ? 'مهارات' : 'Skills'}</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className={`block text-sm font-semibold text-black-600 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className={`block text-xs text-black-500 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'من' : 'From'}
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        className="w-full px-4 py-2 border border-black-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs text-black-500 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? 'الى' : 'To'}
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        className="w-full px-4 py-2 border border-black-200 rounded-lg focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className={`block text-sm font-semibold text-black-600 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? 'التقييمات' : 'Ratings'}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('rating', filters.rating === rating ? 0 : rating)}
                        className="flex-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= filters.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-black-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filter Button */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm sm:text-base bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all hover-scale"
                >
                  {language === 'ar' ? 'مسح التصنيف' : 'Clear Filter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
