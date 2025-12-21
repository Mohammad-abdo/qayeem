'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { evaluationsAPI, ratingsAPI, booksAPI } from '@/lib/api'
import { getBookTitle, getBookCategory } from '@/lib/translations'
import toast from 'react-hot-toast'
import { BookOpen, Trophy, Star, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function EvaluationResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [evaluation, setEvaluation] = useState(null)
  const [rating, setRating] = useState(null)
  const [suggestedBooks, setSuggestedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (params.id) {
      fetchResults()
    }
  }, [params.id, user])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const [evalRes, ratingsRes, recommendedBooksRes] = await Promise.all([
        evaluationsAPI.getById(params.id),
        ratingsAPI.getAll({ evaluationId: params.id }),
        booksAPI.getRecommended().catch(() => ({ data: { books: [] } })), // Fetch recommended books
      ])
      
      setEvaluation(evalRes.data.evaluation)
      
      // Get the latest rating for this evaluation
      const ratings = ratingsRes.data.ratings || []
      if (ratings.length > 0) {
        const latestRating = ratings[0]
        setRating(latestRating)
      }
      
      // Backend already returns top 6 books sorted by match percentage (highest first)
      // Show ALL books returned by backend (even if matchPercentage < 50% or 0%)
      const allRecommendedBooks = recommendedBooksRes.data.books || []
      
      console.log('📚 [RESULTS] Received recommended books from API:', allRecommendedBooks.length)
      console.log('📚 [RESULTS] Books details:', allRecommendedBooks.map(b => ({
        id: b.id,
        title: b.titleAr || b.title,
        matchPercentage: b.matchPercentage,
        isRecommended: b.isRecommended
      })))
      
      // Use all books returned by backend (already limited to 6 and sorted)
      // Don't filter here - backend handles filtering and sorting
      const recommendedOnly = allRecommendedBooks
      
      // Store in sessionStorage to prevent changes when navigating back
      // Use rating ID to track if evaluation results have changed
      const storageKey = `recommended_books_${params.id}_${user?.id}`
      const ratingId = ratings.length > 0 ? ratings[0].id : null
      const storedData = sessionStorage.getItem(storageKey)
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          // If rating ID matches, use stored books (prevents changes on navigation)
          if (parsed.ratingId === ratingId && parsed.books && parsed.books.length > 0) {
            setSuggestedBooks(parsed.books)
          } else {
            // Rating changed or no stored books, use fresh data
            sessionStorage.setItem(storageKey, JSON.stringify({
              ratingId,
              books: recommendedOnly,
              timestamp: Date.now(),
            }))
            setSuggestedBooks(recommendedOnly)
          }
        } catch (e) {
          // Invalid stored data, use fresh
          sessionStorage.setItem(storageKey, JSON.stringify({
            ratingId,
            books: recommendedOnly,
            timestamp: Date.now(),
          }))
          setSuggestedBooks(recommendedOnly)
        }
      } else {
        // No stored data, save and use fresh
        sessionStorage.setItem(storageKey, JSON.stringify({
          ratingId,
          books: recommendedOnly,
          timestamp: Date.now(),
        }))
        setSuggestedBooks(recommendedOnly)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      toast.error(t('common.error'))
      router.push(`/evaluation/${params.id}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Calculate overall score (mock calculation)
  const overallScore = rating ? 90 : 0
  const practicesScore = 95
  const patternsScore = 85

  return (

    <>
        <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header currentPage={`/evaluation/${params.id}`} />


      {/* Breadcrumb */}
      <div className="bg-primary-50 py-4 px-8 mt-24">
        <div className="max-w-7xl mx-auto">
          <Link href="/evaluation" className="text-black-600 hover:text-primary-500">
            {t('nav.evaluation')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <Link href={`/evaluation/${params.id}`} className="text-black-600 hover:text-primary-500">
            {language === 'ar' ? (evaluation?.titleAr || evaluation?.title) : (evaluation?.title || evaluation?.titleAr) || t('nav.evaluation')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <span className="text-black-500">{t('evaluation.results')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-black-100 mb-8 hover-lift animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'تم اكتمال الاختبار بنجاح' : 'Test completed successfully'}
            </h1>
            <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' 
                ? `لقد اكملت اختبار ${language === 'ar' ? (evaluation?.titleAr || evaluation?.title) : (evaluation?.title || evaluation?.titleAr) || 'التقييم'}`
                : `You have completed the evaluation ${(evaluation?.title || evaluation?.titleAr) || 'Evaluation'}`}
            </p>
          </div>

          {/* Overall Score */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 mb-4">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-black-100"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(overallScore / 100) * 552} 552`}
                  className="text-primary-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-primary-500">{overallScore}%</span>
              </div>
            </div>
            <p className={`text-xl font-bold text-black-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('evaluation.overallScore')}</p>
          </div>

          {/* Category Progress */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-black-600">ممارسات</span>
                <span className="text-primary-500 font-semibold">95%</span>
              </div>
              <div className="w-full bg-black-100 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full"
                  style={{ width: '95%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-black-600">أنماط</span>
                <span className="text-primary-500 font-semibold">85%</span>
              </div>
              <div className="w-full bg-black-100 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/evaluation/${params.id}/details`}
              className="text-primary-500 hover:text-primary-400 underline"
            >
              {t('evaluation.viewDetails')}
            </Link>
          </div>
        </div>

        {/* Suggested Books */}
        {suggestedBooks.length > 0 ? (
          <div className="mb-8">
            <h2 className={`text-2xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'الكتب المقترحة' : 'Recommended Books'}
            </h2>
            <p className={`text-black-600 mb-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' 
                ? `عرض ${suggestedBooks.length} من الكتب المتوافقة مع نتائج التقييم (أعلى نسبة توافق)`
                : `Showing ${suggestedBooks.length} books matching your evaluation results (highest match percentage)`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedBooks.map((book, index) => {
                // Use actual book progress if available, otherwise 0
                const progress = book.progress || 0
                return (
                    <div
                    key={book.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border-4 hover:shadow-2xl transition-all duration-500 hover-lift animate-slide-up opacity-0 ${progress > 0 ? 'border-green-500' : 'border-black-100'}`}
                    style={{ animationFillMode: 'forwards', animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden relative">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={getBookTitle(book, language)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/object.png';
                          }}
                        />
                      ) : (
                        <BookOpen className="w-16 h-16 text-primary-500" />
                      )}
                      {/* Match Percentage Badge */}
                      {book.matchPercentage !== undefined && (
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            book.matchPercentage >= 70 ? 'bg-green-500' : 
                            book.matchPercentage >= 50 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-bold text-black-600">
                            {book.matchPercentage.toFixed(1)}%
                          </span>
                          <span className="text-xs text-black-500">
                            {language === 'ar' ? 'توافق' : 'Match'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {/* Match Percentage Bar */}
                      {book.matchPercentage !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-black-600">
                              {language === 'ar' ? 'نسبة التوافق' : 'Match Percentage'}
                            </span>
                            <span className={`text-sm font-bold ${
                              book.matchPercentage >= 70 ? 'text-green-600' : 
                              book.matchPercentage >= 50 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {book.matchPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-black-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                book.matchPercentage >= 70 ? 'bg-green-500' : 
                                book.matchPercentage >= 50 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(book.matchPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-xs text-primary-500 font-semibold">
                          {getBookCategory(book, language) || (language === 'ar' ? 'ممارسات' : 'Practices')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-black-500">
                          {book.averageRating > 0 ? book.averageRating.toFixed(1) : '0.0'}
                        </span>
                        {book.reviewsCount > 0 && (
                          <span className="text-xs text-black-600">
                            ({book.reviewsCount})
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
                      </h3>
                      {progress > 0 ? (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {progress}% {language === 'ar' ? 'مكتمل' : 'completed'}
                            </span>
                          </div>
                          <div className="w-full bg-black-100 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : null}
                      <p className={`text-sm text-black-600 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'القراءة في 7 أيام' : 'Reading in 7 days'}</p>
                      <Link
                        href={`/library/${book.id}`}
                        className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 text-center block"
                      >
                        {t('home.suggestedBooks.bookDetails')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

   
      <Footer />
    </div>
    </>
  )
}

