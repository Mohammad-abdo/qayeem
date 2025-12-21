'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { evaluationsAPI, criteriaAPI, ratingsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, ArrowRight, ArrowLeft, Check, Target, Layers } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EvaluationTestPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [evaluation, setEvaluation] = useState(null)
  const [allCriteria, setAllCriteria] = useState([])
  const [practicesCriteria, setPracticesCriteria] = useState([])
  const [patternsCriteria, setPatternsCriteria] = useState([])
  const [currentSection, setCurrentSection] = useState(null) // null = show path selection, 'PRACTICES' or 'PATTERNS'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [sectionCompleted, setSectionCompleted] = useState({
    PRACTICES: false,
    PATTERNS: false,
  })
  const [showPathSelection, setShowPathSelection] = useState(true)

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
    
    const fetchEvaluation = async () => {
      try {
        setLoading(true)
        const [evalRes, criteriaRes] = await Promise.all([
          evaluationsAPI.getById(params.id),
          criteriaAPI.getByEvaluation(params.id),
        ])
        
        if (!isMounted) return
        
        setEvaluation(evalRes.data.evaluation)
        const fetchedCriteria = criteriaRes.data.criteria || []
        setAllCriteria(fetchedCriteria)
        
        // Split criteria by bookType
        const practices = fetchedCriteria.filter(c => c.bookType === 'PRACTICES' || !c.bookType)
        const patterns = fetchedCriteria.filter(c => c.bookType === 'PATTERNS')
        
        setPracticesCriteria(practices)
        setPatternsCriteria(patterns)
        
        // If both sections exist, show path selection
        if (practices.length > 0 && patterns.length > 0) {
          setShowPathSelection(true)
          setCurrentSection(null)
        } else if (practices.length > 0) {
          setCurrentSection('PRACTICES')
          setShowPathSelection(false)
        } else if (patterns.length > 0) {
          setCurrentSection('PATTERNS')
          setShowPathSelection(false)
        }
        
        // If no criteria found, still allow the page to render
        if (fetchedCriteria.length === 0) {
          toast.error(t('evaluation.noCriteria'))
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching evaluation:', error)
        toast.error(t('evaluation.fetchError'))
        router.push('/evaluation')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchEvaluation()
    
    return () => {
      isMounted = false
    }
  }, [params.id, user?.id, authLoading, router, t])

  const handleAnswer = (criterionId, value) => {
    setAnswers({
      ...answers,
      [criterionId]: value,
    })
  }

  const getCurrentCriteria = () => {
    if (!currentSection) return []
    return currentSection === 'PRACTICES' ? practicesCriteria : patternsCriteria
  }

  const handleNext = () => {
    const currentCriteria = getCurrentCriteria()
    if (currentQuestionIndex < currentCriteria.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Complete current section
      setSectionCompleted({
        ...sectionCompleted,
        [currentSection]: true,
      })
      
      // Move to next section or submit
      if (currentSection === 'PRACTICES' && patternsCriteria.length > 0 && !sectionCompleted.PATTERNS) {
        // Move to PATTERNS section
        setCurrentSection('PATTERNS')
        setCurrentQuestionIndex(0)
      } else if (currentSection === 'PATTERNS' && practicesCriteria.length > 0 && !sectionCompleted.PRACTICES) {
        // Move to PRACTICES section
        setCurrentSection('PRACTICES')
        setCurrentQuestionIndex(0)
      } else {
        // All sections completed, submit
        handleSubmit()
      }
    }
  }

  const handleSelectPath = (path) => {
    setCurrentSection(path)
    setShowPathSelection(false)
    setCurrentQuestionIndex(0)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSection === 'PATTERNS' && practicesCriteria.length > 0) {
      // Go back to PRACTICES section
      setCurrentSection('PRACTICES')
      setCurrentQuestionIndex(practicesCriteria.length - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log('📝 [FRONTEND] Submitting evaluation:', {
        evaluationId: params.id,
        answersCount: Object.keys(answers).length,
        answers: answers
      })
      
      // Create rating with answers
      const ratingData = {
        evaluationId: parseInt(params.id),
        answers: Object.entries(answers).map(([criterionId, value]) => ({
          criterionId: parseInt(criterionId),
          score: value,
        })),
      }
      
      console.log('📝 [FRONTEND] Rating data to send:', ratingData)
      
      const response = await ratingsAPI.create(ratingData)
      console.log('✅ [FRONTEND] Rating submitted successfully:', response.data)
      
      toast.success(t('evaluation.submitSuccess'))
      router.push(`/evaluation/${params.id}/results`)
    } catch (error) {
      console.error('❌ [FRONTEND] Error submitting evaluation:', error)
      console.error('❌ [FRONTEND] Error details:', error.response?.data || error.message)
      toast.error(t('evaluation.submitError'))
    }
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

  if (allCriteria.length === 0) {
    return (
      <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Header currentPage={`/evaluation/${params.id}`} />
        <div className="h-16 sm:h-20 lg:h-24"></div>
        <div className="bg-primary-50 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/evaluation" className="text-sm sm:text-base text-black-600 hover:text-primary-500">
              {t('nav.evaluation')}
            </Link>
            <span className="mx-2 text-black-600">/</span>
            <span className="text-sm sm:text-base text-black-500">
              {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <p className="text-black-600 mb-4">{t('evaluation.noCriteria')}</p>
            <Link href="/evaluation" className="text-primary-500 hover:text-primary-400 underline">
              {t('evaluation.backToEvaluations')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const currentCriteria = getCurrentCriteria()
  const currentCriterion = currentCriteria[currentQuestionIndex]
  const totalQuestions = practicesCriteria.length + patternsCriteria.length
  const answeredQuestions = Object.keys(answers).length
  const currentSectionQuestions = currentSection === 'PRACTICES' ? practicesCriteria.length : (currentSection === 'PATTERNS' ? patternsCriteria.length : 0)
  const currentSectionProgress = currentSectionQuestions > 0 
    ? ((currentQuestionIndex + 1) / currentSectionQuestions) * 100 
    : 0
  const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Don't render question section if path selection is shown or no section selected
  if (showPathSelection || !currentSection || !currentCriterion) {
    // Path selection will be rendered in the return statement
  }

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header currentPage={`/evaluation/${params.id}`} />

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/evaluation" className="text-sm sm:text-base text-black-600 hover:text-primary-500">
            {t('nav.evaluation')}
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <span className="text-sm sm:text-base text-black-500">
            {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Path Selection Screen */}
        {showPathSelection && practicesCriteria.length > 0 && patternsCriteria.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 mb-8">
            <h2 className="text-2xl font-bold text-black-500 mb-4 text-center">
              {language === 'ar' ? 'اختر مسار البدء' : 'Choose Starting Path'}
            </h2>
            <p className="text-black-600 mb-8 text-center">
              {language === 'ar' 
                ? 'هذا التقييم يحتوي على مسارين: الممارسات والأنماط. يجب الإجابة على كلا المسارين. اختر المسار الذي تريد البدء به.'
                : 'This evaluation has two paths: Practices and Patterns. You must answer both paths. Choose which path you want to start with.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button
                onClick={() => handleSelectPath('PRACTICES')}
                className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg p-6 transition-all hover:scale-105"
              >
                <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black-500 mb-2">
                  {language === 'ar' ? 'الممارسات' : 'Practices'}
                </h3>
                <p className="text-sm text-black-600 mb-4">
                  {practicesCriteria.length} {language === 'ar' ? 'سؤال' : 'questions'}
                </p>
                <p className="text-xs text-black-500">
                  {language === 'ar' ? 'ابدأ بأسئلة الممارسات' : 'Start with Practices questions'}
                </p>
              </button>
              <button
                onClick={() => handleSelectPath('PATTERNS')}
                className="bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded-lg p-6 transition-all hover:scale-105"
              >
                <Layers className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black-500 mb-2">
                  {language === 'ar' ? 'الأنماط' : 'Patterns'}
                </h3>
                <p className="text-sm text-black-600 mb-4">
                  {patternsCriteria.length} {language === 'ar' ? 'سؤال' : 'questions'}
                </p>
                <p className="text-xs text-black-500">
                  {language === 'ar' ? 'ابدأ بأسئلة الأنماط' : 'Start with Patterns questions'}
                </p>
              </button>
            </div>
          </div>
        )}

        {!showPathSelection && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 shadow-lg hover-lift transition-all duration-300">
                <div className="flex items-center justify-center mb-6">
                  {evaluation.image ? (
                    <img
                      src={evaluation.image}
                      alt={language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
                      className="w-full h-auto rounded-lg object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/images/object.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-32 h-32 text-primary-500 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className={`text-xl font-bold text-black-500 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? (evaluation.titleAr || evaluation.title) : (evaluation.title || evaluation.titleAr)}
                  </h3>
                  {evaluation.description && (
                    <p className={`text-sm text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (evaluation.descriptionAr || evaluation.description) : (evaluation.description || evaluation.descriptionAr)}
                    </p>
                  )}
                </div>

                {/* Section Navigation */}
                <div className="mt-6 space-y-3">
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentSection === 'PRACTICES'
                        ? 'border-primary-500 bg-primary-50'
                        : sectionCompleted.PRACTICES
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target className={`w-5 h-5 ${
                        currentSection === 'PRACTICES'
                          ? 'text-primary-500'
                          : sectionCompleted.PRACTICES
                          ? 'text-green-500'
                          : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-bold text-black-500">
                          {language === 'ar' ? 'الممارسات' : 'Practices'}
                        </div>
                        <div className="text-sm text-black-600">
                          {practicesCriteria.length} {language === 'ar' ? 'سؤال' : 'questions'}
                        </div>
                      </div>
                      {sectionCompleted.PRACTICES && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {patternsCriteria.length > 0 && (
                    <div
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentSection === 'PATTERNS'
                          ? 'border-primary-500 bg-primary-50'
                          : sectionCompleted.PATTERNS
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Layers className={`w-5 h-5 ${
                          currentSection === 'PATTERNS'
                            ? 'text-primary-500'
                            : sectionCompleted.PATTERNS
                            ? 'text-green-500'
                            : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-bold text-black-500">
                            {language === 'ar' ? 'الأنماط' : 'Patterns'}
                          </div>
                          <div className="text-sm text-black-600">
                            {patternsCriteria.length} {language === 'ar' ? 'سؤال' : 'questions'}
                          </div>
                        </div>
                        {sectionCompleted.PATTERNS && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Section */}
          {currentSection && currentCriterion && (
            <div className="lg:col-span-2">
              {/* Section Header */}
              <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-black-100">
                <div className="flex items-center gap-3 mb-2">
                  {currentSection === 'PRACTICES' ? (
                    <Target className="w-6 h-6 text-primary-500" />
                  ) : (
                    <Layers className="w-6 h-6 text-primary-500" />
                  )}
                  <h2 className="text-xl font-bold text-black-500">
                    {currentSection === 'PRACTICES' 
                      ? (language === 'ar' ? 'الممارسات' : 'Practices')
                      : (language === 'ar' ? 'الأنماط' : 'Patterns')}
                  </h2>
                </div>
                <div className="text-sm text-black-600">
                  {language === 'ar' 
                    ? `السؤال ${currentQuestionIndex + 1} من ${currentSectionQuestions}`
                    : `Question ${currentQuestionIndex + 1} of ${currentSectionQuestions}`}
                </div>
              </div>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('evaluation.progress')} {overallProgress.toFixed(0)}%
                </span>
                <span className="text-sm text-black-500">
                  {answeredQuestions} / {totalQuestions} {language === 'ar' ? 'إجابة' : 'answered'}
                </span>
              </div>
              <div className="w-full bg-black-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Section Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {currentSection === 'PRACTICES' 
                    ? (language === 'ar' ? 'تقدم الممارسات' : 'Practices Progress')
                    : (language === 'ar' ? 'تقدم الأنماط' : 'Patterns Progress')} {currentSectionProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    currentSection === 'PRACTICES' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${currentSectionProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            {currentCriterion && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-black-100 mb-4 sm:mb-6 hover-lift transition-all duration-300">
                <h2 className={`text-xl sm:text-2xl font-bold text-black-500 mb-3 sm:mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? (currentCriterion.titleAr || currentCriterion.title) : (currentCriterion.title || currentCriterion.titleAr) || t('evaluation.questionPlaceholder')}
                </h2>
                {currentCriterion.description && (
                  <p className={`text-sm sm:text-base text-black-600 mb-6 sm:mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? (currentCriterion.descriptionAr || currentCriterion.description) : (currentCriterion.description || currentCriterion.descriptionAr)}
                  </p>
                )}
                <p className={`text-sm sm:text-base text-black-600 mb-6 sm:mb-8 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('evaluation.answerInstructions')}
                </p>

                {/* Answer Options */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                  {[
                    { value: 1, label: t('evaluation.options.notApplicable') },
                    { value: 2, label: t('evaluation.options.slightlyApplicable') },
                    { value: 3, label: t('evaluation.options.somewhatApplicable') },
                    { value: 4, label: t('evaluation.options.veryApplicable') },
                    { value: 5, label: t('evaluation.options.fullyApplicable') },
                  ].map((option) => {
                    const isSelected = answers[currentCriterion.id] === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(currentCriterion.id, option.value)}
                        className={`p-3 sm:p-4 lg:p-6 rounded-lg border-2 transition-all hover:border-primary-300 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-black-100'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl font-bold text-black-500 mb-1 sm:mb-2">
                          {option.value}
                        </div>
                        <div className="text-xs sm:text-sm text-black-600">{option.label}</div>
                        {isSelected && (
                          <div className="mt-2 flex justify-center">
                            <Check className="w-5 h-5 text-primary-500" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 && currentSection === 'PRACTICES'}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
                      currentQuestionIndex === 0 && currentSection === 'PRACTICES'
                        ? 'bg-black-50 text-black-300 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-400 hover-scale'
                    }`}
                  >
                    {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    {t('evaluation.previousQuestion')}
                  </button>

                  <div className="flex gap-2">
                    {currentCriteria.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentQuestionIndex
                            ? 'bg-primary-500'
                            : index < currentQuestionIndex
                            ? 'bg-primary-300'
                            : answers[currentCriteria[index]?.id]
                            ? 'bg-green-300'
                            : 'bg-black-200'
                        }`}
                      ></div>
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 flex items-center justify-center gap-2 hover-scale transition-all text-sm sm:text-base"
                  >
                    {currentQuestionIndex === currentCriteria.length - 1 && 
                     (currentSection === 'PATTERNS' || patternsCriteria.length === 0)
                      ? t('evaluation.finish')
                      : currentQuestionIndex === currentCriteria.length - 1
                      ? (language === 'ar' ? 'التالي: الأنماط' : 'Next: Patterns')
                      : t('evaluation.nextQuestion')}
                    {language === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
        )}

        {/* Show message if both paths need to be completed */}
        {!showPathSelection && currentSection && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              {language === 'ar' 
                ? `أنت تجيب على ${currentSection === 'PRACTICES' ? 'الممارسات' : 'الأنماط'}. ${!sectionCompleted.PRACTICES && !sectionCompleted.PATTERNS ? 'يجب الإجابة على كلا المسارين لإكمال التقييم.' : sectionCompleted.PRACTICES && sectionCompleted.PATTERNS ? 'تم إكمال كلا المسارين!' : `بعد الانتهاء من هذا المسار، ستحتاج إلى الإجابة على ${currentSection === 'PRACTICES' ? 'الأنماط' : 'الممارسات'} أيضاً.`}`
                : `You are answering ${currentSection === 'PRACTICES' ? 'Practices' : 'Patterns'}. ${!sectionCompleted.PRACTICES && !sectionCompleted.PATTERNS ? 'You must answer both paths to complete the evaluation.' : sectionCompleted.PRACTICES && sectionCompleted.PATTERNS ? 'Both paths completed!' : `After finishing this path, you will need to answer ${currentSection === 'PRACTICES' ? 'Patterns' : 'Practices'} as well.`}`}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
