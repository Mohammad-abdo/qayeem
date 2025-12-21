'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usersAPI, notificationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, Trophy, CreditCard, TrendingUp, CheckCircle, Clock, User, Edit, LogOut, Trash2, Bell, Settings } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProfile()
    fetchNotifications()
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getById(user.id, { includeDetails: 'true' })
      const userData = response.data.user
      setProfile(userData)
      setFormData({
        name: userData.name || '',
        nameAr: userData.nameAr || '',
        email: userData.email || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('فشل تحميل الملف الشخصي')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      console.log('📬 [PROFILE] Fetching notifications for user:', user.id)
      const response = await notificationsAPI.getAll()
      console.log('📬 [PROFILE] Notifications response:', response.data)
      
      const allNotifications = response.data?.notifications || response.data || []
      const unreadNotifications = Array.isArray(allNotifications)
        ? allNotifications.filter((n) => !n.isRead).slice(0, 4)
        : []
      
      console.log('📬 [PROFILE] Unread notifications:', unreadNotifications.length)
      setNotifications(unreadNotifications)
    } catch (error) {
      console.error('❌ [PROFILE] Failed to fetch notifications:', error)
      setNotifications([])
    }
  }

  const handleEdit = (field) => {
    setEditing({ ...editing, [field]: true })
  }

  const handleSave = async (field) => {
    try {
      await usersAPI.update(user.id, {
        [field]: formData[field],
      })
      toast.success('تم التحديث بنجاح')
      setEditing({ ...editing, [field]: false })
      fetchProfile()
    } catch (error) {
      toast.error('فشل التحديث')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('هل أنت متأكد من حذف الحساب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }
    try {
      await usersAPI.delete(user.id)
      toast.success('تم حذف الحساب')
      logout()
      router.push('/')
    } catch (error) {
      toast.error('فشل حذف الحساب')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: User },
    { id: 'progress', label: 'تقدم القراءة', icon: BookOpen },
    { id: 'achievements', label: 'الإنجازات', icon: Trophy },
    { id: 'payments', label: 'المدفوعات', icon: CreditCard },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Header */}
      <Header currentPage="/profile" />
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20 lg:h-24"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black-500 mb-2">
            الملف الشخصي
          </h1>
          <p className="text-black-600">
            عرض جميع معلوماتك وأنشطتك
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-500">
                {profile.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black-500 mb-2">
                {profile.name || profile.nameAr || 'بدون اسم'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-black-600 mb-1">البريد الإلكتروني</p>
                  <p className="text-black-500 font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-black-600 mb-1">تاريخ التسجيل</p>
                  <p className="text-black-500 font-medium">
                    {format(new Date(profile.createdAt), 'yyyy-MM-dd', { locale: arSA })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {profile.progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-primary-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-black-500">{profile.progress.stats?.totalBooks || 0}</p>
              <p className="text-sm text-black-600">إجمالي الكتب</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-black-500">{profile.progress.stats?.completedBooks || 0}</p>
              <p className="text-sm text-black-600">كتب مكتملة</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-black-500">{profile.progress.stats?.inProgressBooks || 0}</p>
              <p className="text-sm text-black-600">كتب قيد القراءة</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-8 h-8 text-green-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-black-500">
                {profile.payments?.stats?.totalSpent?.toLocaleString('ar-SA') || 0} ر.س
              </p>
              <p className="text-sm text-black-600">إجمالي الإنفاق</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black-500">الاشعارات</h2>
                {notifications.length > 0 && (
                  <span className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm">
                    {notifications.length} إشعار جديد
                  </span>
                )}
              </div>
              <p className="text-sm text-black-600 mb-4">
                يتم عرض جميع الاشعارات الجديدة
              </p>
              {notifications.length === 0 ? (
                <p className="text-black-600 text-center py-8">لا توجد إشعارات جديدة</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-black-50 rounded-lg p-4 border border-black-100"
                    >
                      <h3 className="font-semibold text-black-500 mb-2">
                        {notification.title || 'عنوان الاشعار'}
                      </h3>
                      <p className="text-sm text-black-600 mb-2 line-clamp-2">
                        {notification.message || 'محتوى الإشعار'}
                      </p>
                      <p className="text-xs text-black-400">
                        {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-black-100">
              <div className="border-b border-black-100">
                <div className="flex gap-2 px-6 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
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
                    {profile.progress && (
                      <>
                        <div>
                          <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات القراءة</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black-50 rounded-lg p-4">
                              <p className="text-sm text-black-600 mb-1">إجمالي الصفحات المقروءة</p>
                              <p className="text-2xl font-bold text-black-500">
                                {profile.progress.stats?.totalPagesRead?.toLocaleString('ar-SA') || 0}
                              </p>
                            </div>
                            <div className="bg-black-50 rounded-lg p-4">
                              <p className="text-sm text-black-600 mb-1">إجمالي الكتب</p>
                              <p className="text-2xl font-bold text-black-500">
                                {profile.progress.stats?.totalBooks || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {profile.payments && (
                      <div>
                        <h3 className="text-lg font-bold text-black-500 mb-4">إحصائيات المدفوعات</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-black-50 rounded-lg p-4">
                            <p className="text-sm text-black-600 mb-1">إجمالي المدفوعات</p>
                            <p className="text-2xl font-bold text-black-500">
                              {profile.payments.stats?.total || 0}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-black-600 mb-1">مكتملة</p>
                            <p className="text-2xl font-bold text-green-600">
                              {profile.payments.stats?.completed || 0}
                            </p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-black-600 mb-1">قيد الانتظار</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {profile.payments.stats?.pending || 0}
                            </p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-black-600 mb-1">فاشلة</p>
                            <p className="text-2xl font-bold text-red-600">
                              {profile.payments.stats?.failed || 0}
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
                    {profile.progress?.allProgress && profile.progress.allProgress.length > 0 ? (
                      <div className="space-y-4">
                        {profile.progress.allProgress.map((progress) => (
                          <Link
                            key={progress.bookId}
                            href={`/library/${progress.bookId}`}
                            className="block bg-black-50 rounded-lg p-4 border border-black-100 hover:bg-primary-50 hover:border-primary-300 transition-colors"
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
                          </Link>
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
                    {profile.achievements?.allAchievements && profile.achievements.allAchievements.length > 0 ? (
                      <div className="space-y-4">
                        {profile.achievements.allAchievements.map((achievement) => (
                          <Link
                            key={achievement.bookId}
                            href={`/library/${achievement.bookId}`}
                            className="block bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 transition-colors"
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
                          </Link>
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
                    {profile.payments?.all && profile.payments.all.length > 0 ? (
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
                            {profile.payments.all.map((payment) => (
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

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        الاسم
                      </label>
                      <div className="flex items-center gap-2">
                        {editing.name ? (
                          <>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              className="flex-1 px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => handleSave('name')}
                              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditing({ ...editing, name: false })}
                              className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={formData.name}
                              disabled
                              className="flex-1 px-4 py-2 border border-black-100 rounded-lg bg-black-50"
                            />
                            <button
                              onClick={() => handleEdit('name')}
                              className="p-2 text-black-600 hover:text-primary-500"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-black-500 mb-2">
                        البريد الإلكتروني
                      </label>
                      <div className="flex items-center gap-2">
                        {editing.email ? (
                          <>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="flex-1 px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => handleSave('email')}
                              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditing({ ...editing, email: false })}
                              className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="flex-1 px-4 py-2 border border-black-100 rounded-lg bg-black-50"
                            />
                            <button
                              onClick={() => handleEdit('email')}
                              className="p-2 text-black-600 hover:text-primary-500"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-black-100">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        حذف الحساب
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 flex items-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

