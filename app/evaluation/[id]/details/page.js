'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { evaluationsAPI, ratingsAPI, criteriaAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EvaluationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [evaluation, setEvaluation] = useState(null)
  const [criteria, setCriteria] = useState([])
  const [rating, setRating] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }
    
    // Check if user is logged in
    if (!user) {
      toast.error(t('evaluation.loginRequired'))
      router.push('/login')
      return
    }
    
    if (!params.id) {
      return
    }

    let isMounted = true
    
    const fetchData = async () => {
      try {
        setLoading(true)
        const [evalRes, criteriaRes, ratingsRes] = await Promise.all([
          evaluationsAPI.getById(params.id),
          criteriaAPI.getByEvaluation(params.id),
          ratingsAPI.getAll({ evaluationId: params.id, userId: user.id }),
        ])
        
        if (!isMounted) return
        
        setEvaluation(evalRes.data.evaluation)
        setCriteria(criteriaRes.data.criteria || [])
        
        // Get the latest rating for this user
        const ratings = ratingsRes.data.ratings || []
        if (ratings.length > 0) {
          // Get the most recent rating with items
          const latestRating = ratings.find(r => r.items && r.items.length > 0) || ratings[0]
          setRating(latestRating)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching evaluation details:', error)
        toast.error(t('evaluation.fetchError'))
        router.push('/evaluation')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [params.id, user?.id, authLoading, router, t])

  // Get answer for a specific criterion
  const getAnswerForCriterion = (criterionId) => {
    if (!rating || !rating.items) return null
    const item = rating.items.find(item => item.criterionId === criterionId)
    return item ? item.score : null
  }

  // Get answer label
  const getAnswerLabel = (score) => {
    const labels = {
      1: { ar: 'لا ينطبق', en: 'Not Applicable' },
      2: { ar: 'ينطبق قليلاً', en: 'Slightly Applicable' },
      3: { ar: 'ينطبق إلى حد ما', en: 'Somewhat Applicable' },
      4: { ar: 'ينطبق كثيراً', en: 'Very Applicable' },
      5: { ar: 'ينطبق تماماً', en: 'Fully Applicable' },
    }
    return labels[score]?.[language] || score
  }

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

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <p className="text-black-600 mb-4">{t('evaluation.notFound')}</p>
          <Link href="/evaluation" className="text-primary-500 hover:text-primary-400 underline">
            {t('evaluation.backToEvaluations')}
          </Link>
        </div>
      </div>
    )
  }

  if (!rating || !rating.items || rating.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Header currentPage={`/evaluation/${params.id}`} />
        <div className="h-16 sm:h-20 lg:h-24"></div>
        <div className="bg-primary-50 py-4 px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/evaluation" className="text-black-600 hover:text-primary-500">
              {t('nav.evaluation')}
            </Link>
            <span className="mx-2 text-black-600">/</span>
            <Link href={`/evaluation/${params.id}`} className="text-black-600 hover:text-primary-500">
              {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
            </Link>
            <span className="mx-2 text-black-600">/</span>
            <span className="text-black-500">{t('evaluation.viewDetails')}</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600 mb-4">{t('evaluation.noResults')}</p>
            <Link
              href={`/evaluation/${params.id}`}
              className="text-primary-500 hover:text-primary-400 underline"
            >
              {t('evaluation.startEvaluation')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage={`/evaluation/${params.id}`} />
      <div className="h-24"></div>

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-4 px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/evaluation" className="text-black-600 hover:text-primary-500">
            {t('nav.evaluation')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <Link href={`/evaluation/${params.id}`} className="text-black-600 hover:text-primary-500">
            {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <Link href={`/evaluation/${params.id}/results`} className="text-black-600 hover:text-primary-500">
            {t('evaluation.results')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <span className="text-black-500">{t('evaluation.viewDetails')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {t('evaluation.questionResults')}
          </h1>
          <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' 
              ? 'عرض جميع الأسئلة وإجاباتك عليها'
              : 'View all questions and your answers'}
          </p>
        </div>

        {/* Evaluation Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 mb-8 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
              </h2>
              {evaluation.description && (
                <p className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? (evaluation.descriptionAr || evaluation.description) : (evaluation.description || evaluation.descriptionAr)}
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500 mb-1">
                {rating.totalScore || 0}
              </div>
              <div className="text-sm text-black-600">{t('evaluation.totalScore')}</div>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-4">
          {criteria.map((criterion, index) => {
            const answer = getAnswerForCriterion(criterion.id)
            const answerLabel = answer ? getAnswerLabel(answer) : null
            
            return (
              <div
                key={criterion.id}
                className="bg-white rounded-lg shadow-md p-6 border border-black-100 hover-lift transition-all duration-300 animate-slide-up opacity-0"
                style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Question Number */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold text-black-500 mb-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (criterion.titleAr || criterion.title) : (criterion.title || criterion.titleAr)}
                    </h3>
                    
                    {criterion.description && (
                      <p className={`text-black-600 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? (criterion.descriptionAr || criterion.description) : (criterion.description || criterion.descriptionAr)}
                      </p>
                    )}

                    {/* Answer */}
                    {answer !== null ? (
                      <div className={`mt-4 p-4 bg-primary-50 rounded-lg border-2 border-primary-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-black-600 mb-1">{t('evaluation.yourAnswer')}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {answer}
                              </div>
                              <span className="text-lg font-semibold text-black-500">{answerLabel}</span>
                            </div>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-4 p-4 bg-black-50 rounded-lg border-2 border-black-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-black-400 flex-shrink-0" />
                          <span className="text-black-600">{t('evaluation.noAnswer')}</span>
                        </div>
                      </div>
                    )}

                    {/* Score Bar */}
                    {answer !== null && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-black-600">{t('evaluation.score')}</span>
                          <span className="text-sm font-semibold text-primary-500">
                            {answer} / {criterion.maxScore || 5}
                          </span>
                        </div>
                        <div className="w-full bg-black-100 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${(answer / (criterion.maxScore || 5)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href={`/evaluation/${params.id}/results`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-all hover-scale"
          >
            {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 rotate-180" />}
            {t('evaluation.backToResults')}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}





