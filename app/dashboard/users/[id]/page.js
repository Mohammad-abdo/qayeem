'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, User, BookOpen, Trophy, CreditCard, TrendingUp, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { admin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  useEffect(() => {
    if (admin && params.id) {
      fetchUserDetails()
    }
  }, [admin, params.id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await adminUsersAPI.getById(params.id, { includeDetails: 'true' })
      setUser(response.data.user)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('فشل تحميل تفاصيل المستخدم')
      router.push('/dashboard/users')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: User },
    { id: 'progress', label: 'تقدم القراءة', icon: BookOpen },
    { id: 'achievements', label: 'الإنجازات', icon: Trophy },
    { id: 'payments', label: 'المدفوعات', icon: CreditCard },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/users"
              className="text-black-600 hover:text-primary-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-black-500">
              تفاصيل المستخدم
            </h1>
          </div>
          <p className="text-black-600">
            عرض جميع معلومات المستخدم وأنشطته
          </p>
        </div>
        <Link
          href={`/dashboard/users/${user.id}/edit`}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          تعديل المستخدم
        </Link>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-500">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              {user.name || user.nameAr || 'بدون اسم'}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-black-600 mb-1">البريد الإلكتروني</p>
                <p className="text-black-500 font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-black-600 mb-1">الهاتف</p>
                  <p className="text-black-500 font-medium">{user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-black-600 mb-1">الدور</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-primary-50 text-primary-500'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                </span>
              </div>
              <div>
                <p className="text-sm text-black-600 mb-1">الحالة</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'نشط' : 'معطل'}
                </span>
              </div>
              <div>
                <p className="text-sm text-black-600 mb-1">تاريخ التسجيل</p>
                <p className="text-black-500 font-medium">
                  {format(new Date(user.createdAt), 'yyyy-MM-dd', { locale: arSA })}
                </p>
              </div>
              {user.address && (
                <div>
                  <p className="text-sm text-black-600 mb-1">العنوان</p>
                  <p className="text-black-500 font-medium">{user.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user.progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-primary-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.totalBooks || 0}</p>
            <p className="text-sm text-black-600">إجمالي الكتب</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.completedBooks || 0}</p>
            <p className="text-sm text-black-600">كتب مكتملة</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.inProgressBooks || 0}</p>
            <p className="text-sm text-black-600">كتب قيد القراءة</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-green-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">
              {user.payments?.stats?.totalSpent?.toLocaleString('ar-SA') || 0} ر.س
            </p>
            <p className="text-sm text-black-600">إجمالي الإنفاق</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-black-100">
        <div className="border-b border-black-100">
          <div className="flex gap-2 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-black-600 hover:text-primary-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {user.progress && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات القراءة</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black-50 rounded-lg p-4">
                        <p className="text-sm text-black-600 mb-1">إجمالي الصفحات المقروءة</p>
                        <p className="text-2xl font-bold text-black-500">
                          {user.progress.stats?.totalPagesRead?.toLocaleString('ar-SA') || 0}
                        </p>
                      </div>
                      <div className="bg-black-50 rounded-lg p-4">
                        <p className="text-sm text-black-600 mb-1">إجمالي الكتب</p>
                        <p className="text-2xl font-bold text-black-500">
                          {user.progress.stats?.totalBooks || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.payments && (
                <div>
                  <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات المدفوعات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">إجمالي المدفوعات</p>
                      <p className="text-2xl font-bold text-black-500">
                        {user.payments.stats?.total || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">مكتملة</p>
                      <p className="text-2xl font-bold text-green-600">
                        {user.payments.stats?.completed || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">قيد الانتظار</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {user.payments.stats?.pending || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">فاشلة</p>
                      <p className="text-2xl font-bold text-red-600">
                        {user.payments.stats?.failed || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              {user.progress?.allProgress && user.progress.allProgress.length > 0 ? (
                <div className="space-y-4">
                  {user.progress.allProgress.map((progress) => (
                    <div
                      key={progress.bookId}
                      className="bg-black-50 rounded-lg p-4 border border-black-100"
                    >
                      <div className="flex items-start gap-4">
                        {progress.coverImage && (
                          <img
                            src={progress.coverImage}
                            alt={progress.bookTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/images/object.png'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-black-500 mb-1">
                            {progress.bookTitleAr || progress.bookTitle}
                          </h4>
                          <p className="text-sm text-black-600 mb-2">
                            {progress.categoryAr || progress.category} - {progress.bookType}
                          </p>
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-black-600">
                                {progress.pagesRead || 0} / {progress.totalPages || 0} صفحة
                              </span>
                              <span className="font-bold text-primary-500">
                                {Math.round(progress.percentage || 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-black-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress.percentage >= 100
                                    ? 'bg-green-500'
                                    : 'bg-primary-500'
                                }`}
                                style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          {progress.lastReadAt && (
                            <p className="text-xs text-black-400">
                              آخر قراءة: {format(new Date(progress.lastReadAt), 'yyyy-MM-dd HH:mm', { locale: arSA })}
                            </p>
                          )}
                          {progress.completedAt && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ مكتمل في: {format(new Date(progress.completedAt), 'yyyy-MM-dd', { locale: arSA })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا يوجد تقدم في القراءة</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              {user.achievements?.allAchievements && user.achievements.allAchievements.length > 0 ? (
                <div className="space-y-4">
                  {user.achievements.allAchievements.map((achievement) => (
                    <div
                      key={achievement.bookId}
                      className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
                    >
                      <div className="flex items-start gap-4">
                        {achievement.coverImage && (
                          <img
                            src={achievement.coverImage}
                            alt={achievement.bookTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/images/object.png'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-bold text-black-500">
                              {achievement.bookTitleAr || achievement.bookTitle}
                            </h4>
                          </div>
                          <p className="text-sm text-black-600 mb-2">
                            {achievement.bookType} - {achievement.pagesRead || 0} صفحة
                          </p>
                          {achievement.completedAt && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ تم الإكمال في: {format(new Date(achievement.completedAt), 'yyyy-MM-dd', { locale: arSA })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا توجد إنجازات</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              {user.payments?.all && user.payments.all.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black-100">
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الكتاب</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">المبلغ</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الحالة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.payments.all.map((payment) => (
                        <tr key={payment.id} className="border-b border-black-100 hover:bg-black-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {payment.coverImage && (
                                <img
                                  src={payment.coverImage}
                                  alt={payment.bookTitle}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = '/images/object.png'
                                  }}
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-black-500">
                                  {payment.bookTitleAr || payment.bookTitle}
                                </p>
                                <p className="text-xs text-black-400">{payment.bookType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-black-500 font-medium">
                            {payment.amount.toLocaleString('ar-SA')} ر.س
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                payment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status === 'COMPLETED'
                                ? 'مكتمل'
                                : payment.status === 'PENDING'
                                ? 'قيد الانتظار'
                                : 'فاشل'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-black-600">
                            {payment.paymentDate
                              ? format(new Date(payment.paymentDate), 'yyyy-MM-dd', { locale: arSA })
                              : format(new Date(payment.createdAt), 'yyyy-MM-dd', { locale: arSA })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا توجد مدفوعات</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { ArrowRight, User, BookOpen, Trophy, CreditCard, TrendingUp, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { admin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  useEffect(() => {
    if (admin && params.id) {
      fetchUserDetails()
    }
  }, [admin, params.id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await adminUsersAPI.getById(params.id, { includeDetails: 'true' })
      setUser(response.data.user)
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('فشل تحميل تفاصيل المستخدم')
      router.push('/dashboard/users')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: User },
    { id: 'progress', label: 'تقدم القراءة', icon: BookOpen },
    { id: 'achievements', label: 'الإنجازات', icon: Trophy },
    { id: 'payments', label: 'المدفوعات', icon: CreditCard },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/users"
              className="text-black-600 hover:text-primary-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-black-500">
              تفاصيل المستخدم
            </h1>
          </div>
          <p className="text-black-600">
            عرض جميع معلومات المستخدم وأنشطته
          </p>
        </div>
        <Link
          href={`/dashboard/users/${user.id}/edit`}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          تعديل المستخدم
        </Link>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-500">
              {user.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-black-500 mb-2">
              {user.name || user.nameAr || 'بدون اسم'}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-black-600 mb-1">البريد الإلكتروني</p>
                <p className="text-black-500 font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-black-600 mb-1">الهاتف</p>
                  <p className="text-black-500 font-medium">{user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-black-600 mb-1">الدور</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-primary-50 text-primary-500'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                </span>
              </div>
              <div>
                <p className="text-sm text-black-600 mb-1">الحالة</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.isActive ? 'نشط' : 'معطل'}
                </span>
              </div>
              <div>
                <p className="text-sm text-black-600 mb-1">تاريخ التسجيل</p>
                <p className="text-black-500 font-medium">
                  {format(new Date(user.createdAt), 'yyyy-MM-dd', { locale: arSA })}
                </p>
              </div>
              {user.address && (
                <div>
                  <p className="text-sm text-black-600 mb-1">العنوان</p>
                  <p className="text-black-500 font-medium">{user.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user.progress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-primary-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.totalBooks || 0}</p>
            <p className="text-sm text-black-600">إجمالي الكتب</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.completedBooks || 0}</p>
            <p className="text-sm text-black-600">كتب مكتملة</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">{user.progress.stats?.inProgressBooks || 0}</p>
            <p className="text-sm text-black-600">كتب قيد القراءة</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-green-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black-500">
              {user.payments?.stats?.totalSpent?.toLocaleString('ar-SA') || 0} ر.س
            </p>
            <p className="text-sm text-black-600">إجمالي الإنفاق</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-black-100">
        <div className="border-b border-black-100">
          <div className="flex gap-2 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-black-600 hover:text-primary-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {user.progress && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات القراءة</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black-50 rounded-lg p-4">
                        <p className="text-sm text-black-600 mb-1">إجمالي الصفحات المقروءة</p>
                        <p className="text-2xl font-bold text-black-500">
                          {user.progress.stats?.totalPagesRead?.toLocaleString('ar-SA') || 0}
                        </p>
                      </div>
                      <div className="bg-black-50 rounded-lg p-4">
                        <p className="text-sm text-black-600 mb-1">إجمالي الكتب</p>
                        <p className="text-2xl font-bold text-black-500">
                          {user.progress.stats?.totalBooks || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {user.payments && (
                <div>
                  <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات المدفوعات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">إجمالي المدفوعات</p>
                      <p className="text-2xl font-bold text-black-500">
                        {user.payments.stats?.total || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">مكتملة</p>
                      <p className="text-2xl font-bold text-green-600">
                        {user.payments.stats?.completed || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">قيد الانتظار</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {user.payments.stats?.pending || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-black-600 mb-1">فاشلة</p>
                      <p className="text-2xl font-bold text-red-600">
                        {user.payments.stats?.failed || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              {user.progress?.allProgress && user.progress.allProgress.length > 0 ? (
                <div className="space-y-4">
                  {user.progress.allProgress.map((progress) => (
                    <div
                      key={progress.bookId}
                      className="bg-black-50 rounded-lg p-4 border border-black-100"
                    >
                      <div className="flex items-start gap-4">
                        {progress.coverImage && (
                          <img
                            src={progress.coverImage}
                            alt={progress.bookTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/images/object.png'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-black-500 mb-1">
                            {progress.bookTitleAr || progress.bookTitle}
                          </h4>
                          <p className="text-sm text-black-600 mb-2">
                            {progress.categoryAr || progress.category} - {progress.bookType}
                          </p>
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-black-600">
                                {progress.pagesRead || 0} / {progress.totalPages || 0} صفحة
                              </span>
                              <span className="font-bold text-primary-500">
                                {Math.round(progress.percentage || 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-black-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress.percentage >= 100
                                    ? 'bg-green-500'
                                    : 'bg-primary-500'
                                }`}
                                style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          {progress.lastReadAt && (
                            <p className="text-xs text-black-400">
                              آخر قراءة: {format(new Date(progress.lastReadAt), 'yyyy-MM-dd HH:mm', { locale: arSA })}
                            </p>
                          )}
                          {progress.completedAt && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ مكتمل في: {format(new Date(progress.completedAt), 'yyyy-MM-dd', { locale: arSA })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا يوجد تقدم في القراءة</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              {user.achievements?.allAchievements && user.achievements.allAchievements.length > 0 ? (
                <div className="space-y-4">
                  {user.achievements.allAchievements.map((achievement) => (
                    <div
                      key={achievement.bookId}
                      className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
                    >
                      <div className="flex items-start gap-4">
                        {achievement.coverImage && (
                          <img
                            src={achievement.coverImage}
                            alt={achievement.bookTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/images/object.png'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-bold text-black-500">
                              {achievement.bookTitleAr || achievement.bookTitle}
                            </h4>
                          </div>
                          <p className="text-sm text-black-600 mb-2">
                            {achievement.bookType} - {achievement.pagesRead || 0} صفحة
                          </p>
                          {achievement.completedAt && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ تم الإكمال في: {format(new Date(achievement.completedAt), 'yyyy-MM-dd', { locale: arSA })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا توجد إنجازات</p>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              {user.payments?.all && user.payments.all.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black-100">
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الكتاب</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">المبلغ</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">الحالة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-black-500">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.payments.all.map((payment) => (
                        <tr key={payment.id} className="border-b border-black-100 hover:bg-black-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {payment.coverImage && (
                                <img
                                  src={payment.coverImage}
                                  alt={payment.bookTitle}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = '/images/object.png'
                                  }}
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-black-500">
                                  {payment.bookTitleAr || payment.bookTitle}
                                </p>
                                <p className="text-xs text-black-400">{payment.bookType}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-black-500 font-medium">
                            {payment.amount.toLocaleString('ar-SA')} ر.س
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                payment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status === 'COMPLETED'
                                ? 'مكتمل'
                                : payment.status === 'PENDING'
                                ? 'قيد الانتظار'
                                : 'فاشل'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-black-600">
                            {payment.paymentDate
                              ? format(new Date(payment.paymentDate), 'yyyy-MM-dd', { locale: arSA })
                              : format(new Date(payment.createdAt), 'yyyy-MM-dd', { locale: arSA })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-black-600 mx-auto mb-4" />
                  <p className="text-black-600">لا توجد مدفوعات</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




