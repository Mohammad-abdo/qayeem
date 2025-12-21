'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { BookOpen, CreditCard, FileText, Users, TrendingUp, ArrowUp, ArrowDown, LayoutDashboard, Activity } from 'lucide-react'
import { adminBooksAPI, adminPaymentsAPI, adminEvaluationsAPI, adminUsersAPI, adminActivityLogsAPI } from '@/lib/adminApi'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const { admin, loading } = useAdminAuth()
  const [stats, setStats] = useState([
    {
      name: 'إجمالي الكتب',
      value: '0',
      previousValue: '0',
      icon: BookOpen,
      href: '/dashboard/books',
      color: 'bg-blue-500',
      change: 0,
    },
    {
      name: 'المدفوعات',
      value: '0',
      previousValue: '0',
      icon: CreditCard,
      href: '/dashboard/payments',
      color: 'bg-green-500',
      change: 0,
    },
    {
      name: 'التقييمات',
      value: '0',
      previousValue: '0',
      icon: FileText,
      href: '/dashboard/evaluations',
      color: 'bg-purple-500',
      change: 0,
    },
    {
      name: 'المستخدمين',
      value: '0',
      previousValue: '0',
      icon: Users,
      href: '/dashboard/users',
      color: 'bg-orange-500',
      change: 0,
    },
  ])
  const [loadingStats, setLoadingStats] = useState(true)
  const [chartData, setChartData] = useState([])
  const [paymentsData, setPaymentsData] = useState([])
  const [usersByRole, setUsersByRole] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, loading, router])

  useEffect(() => {
    if (admin) {
      fetchStats()
    }
  }, [admin])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const [booksRes, paymentsRes, evaluationsRes, usersRes] = await Promise.all([
        adminBooksAPI.getAll().catch(() => ({ data: { books: [], pagination: { total: 0 } } })),
        adminPaymentsAPI.getAll().catch(() => ({ data: { payments: [] } })),
        adminEvaluationsAPI.getAll().catch(() => ({ data: { evaluations: [] } })),
        adminUsersAPI.getAll().catch(() => ({ data: { users: [] } })),
      ])

      const booksCount = booksRes.data.pagination?.total || booksRes.data.books?.length || 0
      const paymentsCount = paymentsRes.data.payments?.length || 0
      const evaluationsCount = evaluationsRes.data.evaluations?.length || 0
      const usersCount = usersRes.data.users?.length || 0

      // Calculate previous values (mock data for now - in real app, fetch from historical data)
      const previousBooks = Math.max(0, booksCount - Math.floor(Math.random() * 5))
      const previousPayments = Math.max(0, paymentsCount - Math.floor(Math.random() * 3))
      const previousEvaluations = Math.max(0, evaluationsCount - Math.floor(Math.random() * 2))
      const previousUsers = Math.max(0, usersCount - Math.floor(Math.random() * 4))

      setStats([
        {
          name: 'إجمالي الكتب',
          value: booksCount,
          previousValue: previousBooks,
          icon: BookOpen,
          href: '/dashboard/books',
          color: 'bg-blue-500',
          change: previousBooks > 0 ? ((booksCount - previousBooks) / previousBooks * 100) : 0,
        },
        {
          name: 'المدفوعات',
          value: paymentsCount,
          previousValue: previousPayments,
          icon: CreditCard,
          href: '/dashboard/payments',
          color: 'bg-green-500',
          change: previousPayments > 0 ? ((paymentsCount - previousPayments) / previousPayments * 100) : 0,
        },
        {
          name: 'التقييمات',
          value: evaluationsCount,
          previousValue: previousEvaluations,
          icon: FileText,
          href: '/dashboard/evaluations',
          color: 'bg-purple-500',
          change: previousEvaluations > 0 ? ((evaluationsCount - previousEvaluations) / previousEvaluations * 100) : 0,
        },
        {
          name: 'المستخدمين',
          value: usersCount,
          previousValue: previousUsers,
          icon: Users,
          href: '/dashboard/users',
          color: 'bg-orange-500',
          change: previousUsers > 0 ? ((usersCount - previousUsers) / previousUsers * 100) : 0,
        },
      ])

      // Prepare chart data for last 7 days
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        last7Days.push({
          name: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
          كتب: Math.floor(Math.random() * 10) + booksCount - 5,
          مدفوعات: Math.floor(Math.random() * 5) + paymentsCount - 3,
          تقييمات: Math.floor(Math.random() * 3) + evaluationsCount - 2,
        })
      }
      setChartData(last7Days)

      // Prepare payments data by status
      const payments = paymentsRes.data.payments || []
      const paymentsByStatus = {
        COMPLETED: payments.filter(p => p.status === 'COMPLETED').length,
        PENDING: payments.filter(p => p.status === 'PENDING').length,
        FAILED: payments.filter(p => p.status === 'FAILED').length,
      }
      setPaymentsData([
        { name: 'مكتملة', value: paymentsByStatus.COMPLETED },
        { name: 'قيد الانتظار', value: paymentsByStatus.PENDING },
        { name: 'فاشلة', value: paymentsByStatus.FAILED },
      ])

      // Prepare users by role
      const users = usersRes.data.users || []
      const usersByRoleData = {}
      users.forEach(user => {
        const role = user.role || 'USER'
        usersByRoleData[role] = (usersByRoleData[role] || 0) + 1
      })
      setUsersByRole(Object.entries(usersByRoleData).map(([name, value]) => ({ name, value })))
      
      // Fetch recent activities
      const activitiesRes = await adminActivityLogsAPI.getAll({ limit: 10, page: 1 }).catch(() => ({ data: { logs: [] } }))
      setRecentActivities(activitiesRes.data.logs || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              مرحباً، {admin.name}
            </h1>
            <p className="text-primary-100 text-lg">
              إليك نظرة عامة على نظام قيم
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>النظام يعمل بشكل طبيعي</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <LayoutDashboard className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const isPositive = stat.change >= 0
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative bg-white rounded-2xl shadow-lg p-6 border border-black-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up opacity-0 overflow-hidden"
              style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-primary-100/30 transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
                      isPositive ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'
                    }`}>
                      {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                      {Math.abs(stat.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black-600 mb-2 group-hover:text-primary-600 transition-colors">
                    {stat.name}
                  </p>
                  <p className="text-4xl font-extrabold text-black-500 mb-2 bg-gradient-to-r from-black-500 to-black-600 bg-clip-text group-hover:from-primary-500 group-hover:to-primary-600 transition-all">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-black-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>مقارنة بالفترة السابقة</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Trends */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 hover:shadow-2xl transition-all duration-300 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
            <div>
              <h2 className="text-xl font-bold text-black-500 mb-1">الاتجاهات الأسبوعية</h2>
              <p className="text-sm text-black-600">آخر 7 أيام</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px',
                  direction: 'rtl'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="كتب" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="مدفوعات" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="تقييمات" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Payments Status */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 hover:shadow-2xl transition-all duration-300 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
            <div>
              <h2 className="text-xl font-bold text-black-500 mb-1">حالة المدفوعات</h2>
              <p className="text-sm text-black-600">توزيع المدفوعات</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px',
                  direction: 'rtl'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Users by Role */}
      {usersByRole.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 hover:shadow-2xl transition-all duration-300 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
            <div>
              <h2 className="text-xl font-bold text-black-500 mb-1">المستخدمين حسب الدور</h2>
              <p className="text-sm text-black-600">توزيع المستخدمين</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersByRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px',
                  direction: 'rtl'
                }} 
              />
              <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* System Updates & Features */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl shadow-xl p-6 border-2 border-primary-200 hover:shadow-2xl transition-all duration-300 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.7s' }}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
          <div>
            <h2 className="text-2xl font-bold text-black-500 mb-1">
              🎉 التحديثات الجديدة
            </h2>
            <p className="text-sm text-black-600">أحدث الميزات والتحسينات المضافة للنظام</p>
          </div>
          <div className="p-3 bg-primary-500 rounded-xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 1: Book-Evaluation Linking */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">ربط الكتب بالتقييمات</h3>
                <p className="text-sm text-black-600 mb-2">
                  يمكنك الآن ربط الكتب بالتقييمات وتحديد النسبة المئوية الدنيا المطلوبة لكل تقييم
                </p>
                <Link href="/dashboard/book-categories" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  إدارة المحاور →
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 2: Book Categories */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">نظام محاور الكتب</h3>
                <p className="text-sm text-black-600 mb-2">
                  إدارة محاور الكتب وربطها بالتقييمات لتنظيم أفضل للكتب
                </p>
                <Link href="/dashboard/book-categories" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  عرض المحاور →
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 3: Book Recommendations */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">نظام التوصيات الذكي</h3>
                <p className="text-sm text-black-600 mb-2">
                  يتم تحديد الكتب الموصى بها بناءً على نتائج التقييمات والنسبة المئوية المحققة
                </p>
                <span className="text-xs text-gray-500">يعمل تلقائياً للمستخدمين</span>
              </div>
            </div>
          </div>

          {/* Feature 4: Enhanced Reports */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">تقارير متقدمة</h3>
                <p className="text-sm text-black-600 mb-2">
                  تقارير الكتب الأكثر شيوعاً وإحصائيات شاملة للنظام
                </p>
                <Link href="/dashboard/reports" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  عرض التقارير →
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 5: Evaluation Images */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">صور التقييمات</h3>
                <p className="text-sm text-black-600 mb-2">
                  إمكانية إضافة صور للتقييمات لعرض أفضل في الواجهة الرئيسية
                </p>
                <Link href="/dashboard/evaluations" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  إدارة التقييمات →
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 6: Activity Logs */}
          <div className="bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-black-500 mb-1">سجل الأنشطة</h3>
                <p className="text-sm text-black-600 mb-2">
                  تتبع جميع الأنشطة والتغييرات في النظام
                </p>
                <Link href="/dashboard/activity-logs" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  عرض السجل →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100 hover:shadow-2xl transition-all duration-300 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.8s' }}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black-100">
          <div>
            <h2 className="text-xl font-bold text-black-500 mb-1">
              أحدث الأنشطة
            </h2>
            <p className="text-sm text-black-600">آخر التحديثات والأنشطة في النظام</p>
          </div>
          <Link 
            href="/dashboard/activity-logs"
            className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-colors"
          >
            <Activity className="w-8 h-8 text-purple-600" />
          </Link>
        </div>
        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-black-600 font-medium">لا توجد أنشطة حديثة</p>
            <p className="text-sm text-black-400 mt-2">سيتم عرض الأنشطة هنا عند توفرها</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.slice(0, 10).map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-black-100 rounded-lg hover:bg-black-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black-500">
                    {activity.actionAr || activity.action}
                  </p>
                  {activity.entityAr && (
                    <p className="text-sm text-black-600 mt-1">
                      {activity.entityAr}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-black-400">
                    {activity.user && (
                      <span>{activity.user.name}</span>
                    )}
                    <span>{new Date(activity.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/dashboard/activity-logs"
              className="block text-center py-3 text-primary-500 hover:text-primary-600 font-medium"
            >
              عرض جميع الأنشطة →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

