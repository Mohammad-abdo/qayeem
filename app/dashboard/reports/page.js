'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminReportsAPI, adminEvaluationsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { FileText, Download, Plus, TrendingUp, BookOpen, BarChart3, Users, Activity } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [evaluations, setEvaluations] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState('')
  const [reportType, setReportType] = useState('SUMMARY')
  const [popularBooks, setPopularBooks] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loadingReports, setLoadingReports] = useState(false)
  const [activeTab, setActiveTab] = useState('general') // 'general', 'popular-books', 'statistics'

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
      return
    }
    
    if (admin) {
      fetchEvaluations()
      fetchPopularBooks()
      fetchStatistics()
      if (activeTab === 'general') {
        fetchReports()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, authLoading, router, activeTab])

  const fetchEvaluations = async () => {
    try {
      setLoading(true)
      const response = await adminEvaluationsAPI.getAll()
      setEvaluations(response.data.evaluations || [])
    } catch (error) {
      toast.error('فشل تحميل التقييمات')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await adminReportsAPI.getAll()
      setReports(response.data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('فشل تحميل التقارير')
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularBooks = async () => {
    try {
      setLoadingReports(true)
      const response = await adminReportsAPI.getPopularBooks()
      setPopularBooks(response.data.popularBooks || [])
    } catch (error) {
      console.error('Error fetching popular books:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await adminReportsAPI.getStatistics()
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedEvaluation) {
      toast.error('يرجى اختيار تقييم')
      return
    }

    try {
      setGenerating(true)
      const response = await adminReportsAPI.generate(selectedEvaluation, reportType)
      toast.success('تم إنشاء التقرير بنجاح')
      // Refresh reports list
      if (activeTab === 'general') {
        fetchReports()
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error.response?.data?.error || 'فشل إنشاء التقرير')
    } finally {
      setGenerating(false)
    }
  }


  const handleExport = async (reportId, format = 'json') => {
    try {
      // Get report data first
      const reportResponse = await adminReportsAPI.getById(reportId)
      const report = reportResponse.data.report

      if (format === 'pdf') {
        exportToPDF(report)
      } else if (format === 'csv') {
        exportToCSV(report)
      } else {
        // JSON export
        const dataStr = JSON.stringify(report, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `report-${reportId}.json`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('تم تصدير التقرير بنجاح')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.error || 'فشل تصدير التقرير')
    }
  }

  const exportToPDF = (report) => {
    if (typeof window === 'undefined') return

    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()
      const reportData = report.data || {}

      let yPos = 20
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const lineHeight = 7
      const pageWidth = doc.internal.pageSize.width

      // Title
      doc.setFontSize(20)
      doc.text(report.title || 'تقرير', pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Report info
      doc.setFontSize(12)
      doc.text(`التاريخ: ${new Date(report.generatedAt).toLocaleDateString('ar-SA')}`, margin, yPos)
      yPos += lineHeight
      doc.text(`النوع: ${report.type}`, margin, yPos)
      yPos += lineHeight * 2

      // Evaluation info
      if (reportData.evaluation) {
        doc.setFontSize(16)
        doc.text('معلومات التقييم', margin, yPos)
        yPos += lineHeight * 1.5
        doc.setFontSize(12)
        doc.text(`العنوان: ${reportData.evaluation.titleAr || reportData.evaluation.title}`, margin, yPos)
        yPos += lineHeight * 2
      }

      // Summary
      if (reportData.summary) {
        doc.setFontSize(16)
        doc.text('ملخص', margin, yPos)
        yPos += lineHeight * 1.5
        doc.setFontSize(12)
        doc.text(`إجمالي التقييمات: ${reportData.summary.totalRatings}`, margin, yPos)
        yPos += lineHeight
        doc.text(`متوسط النقاط: ${reportData.summary.averageScore}`, margin, yPos)
        yPos += lineHeight
        doc.text(`عدد المعايير: ${reportData.summary.criteriaCount}`, margin, yPos)
        yPos += lineHeight * 2
      }

      // Criterion stats
      if (reportData.criterionStats && reportData.criterionStats.length > 0) {
        doc.setFontSize(16)
        doc.text('إحصائيات المعايير', margin, yPos)
        yPos += lineHeight * 1.5

        reportData.criterionStats.forEach((criterion, index) => {
          if (yPos > pageHeight - 30) {
            doc.addPage()
            yPos = 20
          }

          doc.setFontSize(12)
          doc.text(`${index + 1}. ${criterion.criterionTitle}`, margin, yPos)
          yPos += lineHeight
          doc.text(`   متوسط النقاط: ${criterion.averageScore} / ${criterion.maxScore}`, margin + 10, yPos)
          yPos += lineHeight
          doc.text(`   عدد التقييمات: ${criterion.totalRatings}`, margin + 10, yPos)
          yPos += lineHeight * 1.5
        })
      }

      doc.save(`report-${report.id}.pdf`)
      toast.success('تم تصدير التقرير بصيغة PDF')
    }).catch(error => {
      console.error('PDF export error:', error)
      toast.error('فشل تصدير PDF')
    })
  }

  const exportToCSV = (report) => {
    if (typeof window === 'undefined') return

    import('papaparse').then(({ default: Papa }) => {
      const reportData = report.data || {}
      const csvData = []

      // Header
      csvData.push(['المعيار', 'متوسط النقاط', 'أقصى نقاط', 'عدد التقييمات'])

      // Criterion stats
      if (reportData.criterionStats && reportData.criterionStats.length > 0) {
        reportData.criterionStats.forEach(criterion => {
          csvData.push([
            criterion.criterionTitle || '',
            criterion.averageScore || 0,
            criterion.maxScore || 0,
            criterion.totalRatings || 0
          ])
        })
      }

      const csv = Papa.unparse(csvData)
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `report-${report.id}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('تم تصدير التقرير بصيغة CSV')
    }).catch(error => {
      console.error('CSV export error:', error)
      toast.error('فشل تصدير CSV')
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-black-500">
          التقارير
        </h1>
        <p className="mt-2 text-black-600">
          إنشاء وتصدير التقارير
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <div className="flex gap-4 border-b border-black-100">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'general'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-black-600 hover:text-black-500'
            }`}
          >
            <FileText className="w-4 h-4 inline-block ml-2" />
            تقارير عامة
          </button>
          <button
            onClick={() => setActiveTab('popular-books')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'popular-books'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-black-600 hover:text-black-500'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block ml-2" />
            الكتب الأكثر ظهوراً
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'statistics'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-black-600 hover:text-black-500'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block ml-2" />
            إحصائيات شاملة
          </button>
        </div>
      </div>

      {/* General Reports Tab */}
      {activeTab === 'general' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <h2 className="text-xl font-bold text-black-500 mb-4">
              إنشاء تقرير جديد
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  التقييم *
                </label>
                <select
                  value={selectedEvaluation}
                  onChange={(e) => setSelectedEvaluation(e.target.value)}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                >
                  <option value="">اختر تقييم</option>
                  {evaluations.map((evaluation) => (
                    <option key={evaluation.id} value={evaluation.id}>
                      {evaluation.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  نوع التقرير *
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                >
                  <option value="SUMMARY">ملخص</option>
                  <option value="DETAILED">مفصل</option>
                  <option value="COMPARATIVE">مقارن</option>
                  <option value="STATISTICAL">إحصائي</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating || !selectedEvaluation}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center w-full disabled:opacity-50"
                >
                  <Plus className="ml-2 w-5 h-5" />
                  {generating ? 'جاري الإنشاء...' : 'إنشاء تقرير'}
                </button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <h2 className="text-xl font-bold text-black-500 mb-4">
          التقارير السابقة
        </h2>
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600">
              لا توجد تقارير متاحة
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-black-100 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-black-500">
                    {report.title}
                  </h3>
                  <p className="text-sm text-black-600">
                    {report.type} - {new Date(report.generatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport(report.id, 'pdf')}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
                    title="تصدير PDF"
                  >
                    <Download className="ml-1 w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport(report.id, 'csv')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
                    title="تصدير CSV"
                  >
                    <Download className="ml-1 w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport(report.id, 'json')}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
                    title="تصدير JSON"
                  >
                    <Download className="ml-1 w-4 h-4" />
                    JSON
                  </button>
                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
                  >
                    <FileText className="ml-2 w-4 h-4" />
                    عرض
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </>
      )}

      {/* Popular Books Tab */}
      {activeTab === 'popular-books' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
          <h2 className="text-xl font-bold text-black-500 mb-6">
            الكتب الأكثر ظهوراً في التقييمات
          </h2>
          {loadingReports ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : popularBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-black-600 mx-auto mb-4" />
              <p className="text-black-600">لا توجد بيانات متاحة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {popularBooks.map((item, index) => (
                <div
                  key={item.book.id}
                  className="border border-black-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center text-2xl font-bold text-primary-500">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-black-500">
                            {item.book.title}
                          </h3>
                          {item.book.titleAr && (
                            <p className="text-black-600 text-sm">{item.book.titleAr}</p>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-primary-500 font-bold">
                            <TrendingUp className="w-5 h-5" />
                            {item.evaluationCount} تقييم
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-black-600">إجمالي التقييمات:</span>
                          <span className="font-bold text-black-500 mr-2">{item.totalRatings}</span>
                        </div>
                        <div>
                          <span className="text-black-600">مطلوب في:</span>
                          <span className="font-bold text-black-500 mr-2">{item.isRequiredCount}</span>
                        </div>
                        <div>
                          <span className="text-black-600">متوسط التقييمات:</span>
                          <span className="font-bold text-black-500 mr-2">{item.averageRatings.toFixed(1)}</span>
                        </div>
                      </div>
                      {item.evaluations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-black-100">
                          <p className="text-sm font-medium text-black-600 mb-2">التقييمات المرتبطة:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.evaluations.map((evaluation) => (
                              <span
                                key={evaluation.id}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  evaluation.isRequired
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {evaluation.titleAr || evaluation.title} {evaluation.isRequired && '(مطلوب)'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && statistics && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black-600 mb-1">إجمالي الكتب</p>
                  <p className="text-3xl font-bold text-black-500">{statistics.overview.totalBooks}</p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black-600 mb-1">إجمالي التقييمات</p>
                  <p className="text-3xl font-bold text-black-500">{statistics.overview.totalEvaluations}</p>
                  <p className="text-xs text-green-600 mt-1">{statistics.overview.activeEvaluations} نشط</p>
                </div>
                <FileText className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black-600 mb-1">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-black-500">{statistics.overview.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-orange-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black-600 mb-1">التقييمات المكتملة</p>
                  <p className="text-3xl font-bold text-black-500">{statistics.overview.totalRatings}</p>
                </div>
                <Activity className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Popular Evaluations */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <h3 className="text-lg font-bold text-black-500 mb-4">أكثر التقييمات شعبية</h3>
            <div className="space-y-3">
              {statistics.popularEvaluations.map((evaluation, index) => (
                <div
                  key={evaluation.id}
                  className="flex items-center justify-between p-3 border border-black-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-black-500">{evaluation.title}</p>
                      {evaluation.titleAr && <p className="text-sm text-black-600">{evaluation.titleAr}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-black-600">
                      <FileText className="w-4 h-4 inline-block ml-1" />
                      {evaluation.ratingsCount} تقييم
                    </span>
                    <span className="text-black-600">
                      <BookOpen className="w-4 h-4 inline-block ml-1" />
                      {evaluation.booksCount} كتاب
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Statistics */}
          {statistics.categoryStatistics && statistics.categoryStatistics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات المحاور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.categoryStatistics.map((cat) => (
                  <div
                    key={cat.id}
                    className="border border-black-100 rounded-lg p-4"
                  >
                    <p className="font-bold text-black-500">{cat.nameAr || cat.name}</p>
                    <p className="text-2xl font-bold text-primary-500 mt-2">{cat.booksCount} كتاب</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

