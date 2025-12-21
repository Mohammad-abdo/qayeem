'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { booksAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, Search, Star, Filter, X } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LibraryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    axis: '',
    element: '',
    minRating: 0,
    minPrice: 0,
    maxPrice: 10000,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const booksPerPage = 9

  useEffect(() => {
    fetchBooks()
  }, [searchTerm, filters, currentPage])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      // Backend only supports: status, category, search, page, limit
      const params = {
        search: searchTerm || undefined,
        page: currentPage,
        limit: booksPerPage,
        // Use category filter if axis is selected
        ...(filters.axis ? { category: filters.axis } : {}),
      }
      const response = await booksAPI.getAll(params)
      const booksData = response.data.books || []
      
      // Client-side filtering for rating and price (since backend doesn't support them)
      let filteredBooks = booksData
      
      if (filters.minRating > 0) {
        // Filter by rating (mock - would need actual rating data)
        filteredBooks = filteredBooks.filter(() => Math.random() > 0.3) // Mock filter
      }
      
      if (filters.maxPrice < 10000) {
        filteredBooks = filteredBooks.filter((book) => 
          parseFloat(book.price) <= filters.maxPrice
        )
      }
      
      setBooks(filteredBooks)
      setTotalBooks(response.data.pagination?.total || filteredBooks.length)
      setTotalPages(
        Math.ceil((response.data.pagination?.total || filteredBooks.length) / booksPerPage)
      )
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('فشل تحميل الكتب')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      axis: '',
      element: '',
      minRating: 0,
      minPrice: 0,
      maxPrice: 10000,
    })
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Header */}
      <Header currentPage="/library" />

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-4 ">
        <div className="max-w-7xl mx-auto">
          <span className="text-black-600">المكتبة</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto  py-8 flex gap-8">
        {/* Filters Sidebar */}
        <div className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black-500">التصفية</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-black-600 hover:text-black-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Axis Filter */}
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  المحور
                </label>
                <select
                  value={filters.axis}
                  onChange={(e) => setFilters({ ...filters, axis: e.target.value })}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع المحاور</option>
                  <option value="الصحة البدنية">الصحة البدنية</option>
                  <option value="الصحة النفسية">الصحة النفسية</option>
                  <option value="التطوير المهني">التطوير المهني</option>
                </select>
              </div>

              {/* Element Filter */}
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  العنصر
                </label>
                <select
                  value={filters.element}
                  onChange={(e) => setFilters({ ...filters, element: e.target.value })}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع العناصر</option>
                  <option value="ممارسات">ممارسات</option>
                  <option value="أنماط">أنماط</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  التقييمات
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          minRating: filters.minRating === rating ? 0 : rating,
                        })
                      }
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        filters.minRating >= rating
                          ? 'bg-yellow-100'
                          : 'bg-black-50 hover:bg-black-100'
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          filters.minRating >= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-black-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  السعر: {filters.minPrice} - {filters.maxPrice} ر.س
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100"
              >
                مسح التصنيف
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black-500">جميع الكتب</h1>
                <p className="text-black-600 mt-2">{totalBooks} كتاب متاح</p>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                تصفية
              </button>
            </div>

            {/* Recommendation Banner */}
            <div className="bg-black-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-black-600">
                ننصح بإجراء التقييم قبل الشراء لتأكيد أن هذا الكتاب مناسب لك.
              </p>
              <Link
                href="/evaluation"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 whitespace-nowrap"
              >
                اجراء التقييم
              </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-black-600" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                placeholder="ابحث عن كتاب..."
              />
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BookOpen className="w-16 h-16 text-black-600 mx-auto mb-4" />
              <p className="text-black-600">لا توجد كتب متاحة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up opacity-0"
                  style={{ animationFillMode: 'forwards', animationDelay: `${(index % 6) * 0.1}s` }}
                >
                  {/* Book Cover */}
                  <div className="h-64 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden group">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title || book.titleAr || 'كتاب'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <img
                        src="/images/object.png"
                        alt={book.title || book.titleAr || 'كتاب'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>
                  {/* Book Details */}
                  <div className="p-4">
                    <div className="flex items-end justify-end w-full gap-3 mb-3">
                      {book.category && (
                        <div className="bg-primary-50 px-3 py-1 rounded-lg text-primary-500 text-xs font-semibold whitespace-nowrap">
                          {book.categoryAr || book.category}
                        </div>
                      )}
                    
                    </div>
                    <div className="flex items-end justify-end w-full gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-black-500 flex-1 text-right">
                        {book.titleAr || book.title || 'اسم الكتاب'}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between  gap-3 mb-2">
                      <p className="text-2xl font-bold text-black-500">
                        {parseFloat(book.price).toFixed(0)} ج.م
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-base font-semibold text-black-500">
                          4.8
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-black-600 mb-4 line-clamp-2 text-right min-h-[40px]">
                      {book.descriptionAr || book.description || 'وصف مختصر للكتاب يوضح محتواه وفائدته للقارئ.'}
                    </p>
                    <Link
                      href={`/library/${book.id}`}
                      className="w-full px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 text-center block hover:scale-105"
                    >
                      تفاصيل الكتاب
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-black-100 rounded-lg hover:bg-black-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'border border-black-100 hover:bg-black-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-black-100 rounded-lg hover:bg-black-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

