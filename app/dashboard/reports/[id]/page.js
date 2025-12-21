'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminReportsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, Download, FileText, BarChart3, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { admin, loading: authLoading } = useAdminAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    if (!params.id) return
    try {
      setLoading(true)
      const response = await adminReportsAPI.getById(params.id)
      setReport(response.data.report)
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('فشل تحميل التقرير')
      router.push('/dashboard/reports')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    } else if (admin && params.id) {
      fetchReport()
    }
  }, [admin, authLoading, params.id, router, fetchReport])

  const handleExport = async (format) => {
    if (!report) return

    try {
      if (format === 'pdf') {
        exportToPDF()
      } else if (format === 'csv') {
        exportToCSV()
      } else {
        // JSON export
        const dataStr = JSON.stringify(report, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `report-${report.id}.json`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('تم تصدير التقرير بنجاح')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('فشل تصدير التقرير')
    }
  }

  const exportToPDF = () => {
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
      toast.error('فشل تصدير PDF. تأكد من تثبيت المكتبة.')
    })
  }

  const exportToCSV = () => {
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
      toast.error('فشل تصدير CSV. تأكد من تثبيت المكتبة.')
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">التقرير غير موجود</p>
        <Link href="/dashboard/reports" className="text-primary-500 hover:underline mt-4 inline-block">
          العودة إلى التقارير
        </Link>
      </div>
    )
  }

  const reportData = report.data || {}
  const summary = reportData.summary || {}
  const criterionStats = reportData.criterionStats || []

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/reports"
                className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">
                {report.title}
              </h1>
            </div>
            <p className="text-primary-100 mb-2">
              تاريخ الإنشاء: {new Date(report.generatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-primary-100">
              نوع التقرير: {report.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Info */}
      {reportData.evaluation && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-500" />
            معلومات التقييم
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">العنوان:</span> {reportData.evaluation.titleAr || reportData.evaluation.title}
            </p>
            {reportData.evaluation.title && reportData.evaluation.titleAr && (
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Title:</span> {reportData.evaluation.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          الملخص
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي التقييمات</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalRatings || 0}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">متوسط النقاط</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.averageScore?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">عدد المعايير</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.criteriaCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Criterion Statistics */}
      {criterionStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">إحصائيات المعايير</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">المعيار</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">متوسط النقاط</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">أقصى نقاط</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">عدد التقييمات</th>
                </tr>
              </thead>
              <tbody>
                {criterionStats.map((criterion, index) => (
                  <tr key={criterion.criterionId || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{criterion.criterionTitle}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{criterion.averageScore?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{criterion.maxScore || 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{criterion.totalRatings || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


