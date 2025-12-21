'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { evaluationsAPI, ratingsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, FileText, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EvaluationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [evaluations, setEvaluations] = useState([])
  const [completedEvaluations, setCompletedEvaluations] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvaluations()
  }, [user])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await evaluationsAPI.getAll({ status: 'ACTIVE' })
      const evaluationsData = response.data.evaluations || []
      setEvaluations(evaluationsData)

      // Fetch user's completed ratings if user is logged in
      if (user) {
        try {
          const ratingsResponse = await ratingsAPI.getAll({ userId: user.id, status: 'SUBMITTED' })
          const ratings = ratingsResponse.data.ratings || []
          const completedIds = new Set(ratings.map(r => r.evaluationId))
          setCompletedEvaluations(completedIds)
        } catch (error) {
          console.error('Error fetching ratings:', error)
        }
      }
    } catch (error) {
      toast.error(t('evaluation.fetchError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header currentPage="/evaluation" />
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20 lg:h-24"></div>

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-sm sm:text-base text-black-600">{t('nav.evaluation')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-black-500 mb-3 sm:mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {t('evaluation.title')}
          </h1>
          <p className={`text-sm sm:text-base text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' 
              ? 'اختر التقييم الذي تريد إجراؤه لمعرفة نقاط قوتك وفرص التطوير'
              : 'Choose the evaluation you want to take to know your strengths and development opportunities'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600">
              {language === 'ar' ? 'لا توجد تقييمات متاحة حالياً' : 'No evaluations available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {evaluations.map((evaluation) => {
              const isCompleted = completedEvaluations.has(evaluation.id)
              
              return (
                <div
                  key={evaluation.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-2 hover:shadow-lg transition-shadow hover-lift relative ${
                    isCompleted ? 'border-green-500' : 'border-black-100'
                  }`}
                >
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  )}

                  {/* Evaluation Image */}
                  <div className="h-42 sm:h-42 bg-gradient-to-br from-primary-50 p-2 to-primary-100 flex items-center justify-center overflow-hidden relative">
                    {evaluation.image ? (
                      <img
                        src={evaluation.image}
                        alt={language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/object.png';
                        }}
                      />
                    ) : (
                      <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-primary-500 opacity-50" />
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="mb-4">
                      <h3 className={`text-sm font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr) || t('evaluation.title')}
                      </h3>
                      {evaluation.description && (
                        <p className={`text-sm text-black-600 line-clamp-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {language === 'ar' 
                            ? (evaluation.descriptionAr || evaluation.description)
                            : (evaluation.description || evaluation.descriptionAr)}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar for Completed Evaluations */}
                    {isCompleted && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-black-600">
                            {language === 'ar' ? 'مكتمل' : 'Completed'}
                          </span>
                          <span className="font-bold text-green-600">100%</span>
                        </div>
                        <div className="w-full bg-black-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <Link
                      href={isCompleted ? `/evaluation/${evaluation.id}/results` : `/evaluation/${evaluation.id}`}
                      className={`w-full px-4 py-2 rounded-lg text-center block hover-scale transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-primary-500 text-white hover:bg-primary-400'
                      }`}
                    >
                      {isCompleted 
                        ? (language === 'ar' ? 'عرض النتائج' : 'View Results')
                        : t('evaluation.start')}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

