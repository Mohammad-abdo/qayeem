'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminBooksAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, BookOpen, Filter, Star, TrendingUp, CheckCircle, Users, Award } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import SearchInput from '@/components/dashboard/SearchInput'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'

export default function BooksPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    outOfStock: 0,
  })
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  useEffect(() => {
    if (admin) {
      fetchBooks()
    }
  }, [admin, searchTerm, statusFilter])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = {
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        includeStats: 'true', // Request statistics for dashboard
      }
      const response = await adminBooksAPI.getAll(params)
      const booksData = response.data.books || []
      setBooks(booksData)
      
      // Calculate stats
      setStats({
        total: booksData.length,
        active: booksData.filter(b => b.status === 'ACTIVE').length,
        inactive: booksData.filter(b => b.status === 'INACTIVE').length,
        outOfStock: booksData.filter(b => b.status === 'OUT_OF_STOCK').length,
      })
    } catch (error) {
      toast.error('فشل تحميل الكتب')
    } finally {
      setLoading(false)
    }
  }

  // Determine border color based on book statistics
  const getBookBorderClass = (book) => {
    const stats = book.stats || {}
    const purchaseCount = stats.purchaseCount || 0
    const achievementCount = stats.achievementCount || 0
    const purchasePercentage = stats.purchasePercentage || 0

    // High achievement rate (>= 50% of purchasers completed)
    if (purchaseCount > 0 && purchasePercentage >= 50) {
      return 'border-4 border-purple-500'
    }

    // Has achievements but lower rate
    if (achievementCount > 0) {
      return 'border-4 border-blue-500'
    }

    // Has purchases but no achievements yet
    if (purchaseCount > 0) {
      return 'border-4 border-yellow-500'
    }

    // Default for books with no purchases
    return 'border-2 border-gray-200'
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا الكتاب؟', async () => {
      try {
        await adminBooksAPI.delete(id)
        toast.success('تم حذف الكتاب بنجاح')
        fetchBooks()
      } catch (error) {
        toast.error('فشل حذف الكتاب')
      }
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <PageHeader
        title="إدارة الكتب"
        description="إدارة وتنظيم الكتب والمحتوى"
        gradient={true}
        actionButton={
          <Link
            href="/dashboard/books/new"
            className="px-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            إضافة كتاب جديد
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-black-600 mb-1">إجمالي الكتب</p>
          <p className="text-3xl font-bold text-black-500">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-black-600 mb-1">نشطة</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-black-600 mb-1">غير نشطة</p>
          <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-black-600 mb-1">نفدت</p>
          <p className="text-3xl font-bold text-orange-600">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-black-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchBooks()}
              placeholder="ابحث عن كتاب..."
              className="py-3 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-black-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-black-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
            >
              <option value="">جميع الحالات</option>
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="OUT_OF_STOCK">نفدت</option>
              <option value="ARCHIVED">مؤرشف</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد كتب متاحة"
          description="ابدأ بإضافة كتاب جديد"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {books.map((book, index) => {
            const stats = book.stats || {}
            const borderClass = getBookBorderClass(book)
            
            return (
            <div 
              key={book.id} 
              className={`group bg-white rounded-2xl shadow-lg overflow-hidden ${borderClass} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up opacity-0 relative`}
              style={{ animationFillMode: 'forwards', animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {/* Cover Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-primary-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    book.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                    book.status === 'INACTIVE' ? 'bg-gray-500 text-white' :
                    book.status === 'OUT_OF_STOCK' ? 'bg-orange-500 text-white' :
                    'bg-black-500 text-white'
                  }`}>
                    {book.status === 'ACTIVE' ? 'نشط' :
                     book.status === 'INACTIVE' ? 'غير نشط' :
                     book.status === 'OUT_OF_STOCK' ? 'نفدت' : 'مؤرشف'}
                  </span>
                  {stats.purchaseCount > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stats.purchaseCount}
                    </span>
                  )}
                  {stats.achievementCount > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {stats.achievementCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-black-500 mb-2 line-clamp-1">
                  {book.titleAr || book.title}
                </h3>
                {book.titleAr && book.title && (
                  <p className="text-sm text-black-400 mb-3 line-clamp-1">
                    {book.title}
                  </p>
                )}
                {book.author && (
                  <p className="text-sm text-black-600 mb-3 flex items-center gap-2">
                    <span className="font-medium">المؤلف:</span>
                    <span>{book.authorAr || book.author}</span>
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-primary-500">
                    {parseFloat(book.price).toFixed(2)} ر.س
                  </p>
                  {book.stock !== undefined && (
                    <p className="text-sm text-black-400">
                      {book.stock} نسخة
                    </p>
                  )}
                </div>

                {/* Statistics */}
                {stats && (stats.purchaseCount > 0 || stats.achievementCount > 0) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {stats.purchaseCount > 0 && (
                        <div className="flex items-center gap-1 text-black-600">
                          <Users className="w-3 h-3 text-yellow-600" />
                          <span className="font-semibold">{stats.purchaseCount}</span>
                          <span>مشترى</span>
                        </div>
                      )}
                      {stats.achievementCount > 0 && (
                        <div className="flex items-center gap-1 text-black-600">
                          <Award className="w-3 h-3 text-blue-600" />
                          <span className="font-semibold">{stats.achievementCount}</span>
                          <span>إنجاز</span>
                        </div>
                      )}
                      {stats.purchaseCount > 0 && (
                        <div className="col-span-2 flex items-center gap-1 text-black-600">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          <span className="font-semibold">{stats.purchasePercentage}%</span>
                          <span>معدل الإنجاز</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-black-100">
                  <Link
                    href={`/dashboard/books/${book.id}`}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:scale-105 text-center font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    عرض
                  </Link>
                  <Link
                    href={`/dashboard/books/${book.id}/edit`}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 hover:scale-105"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-105"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}


