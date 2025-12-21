'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminNotificationsAPI } from '@/lib/adminApi'
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Moon,
  Sun,
  Shield,
  Key,
  Activity,
  BookOpen as BookOpenIcon,
  List,
  Ticket,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { BookOpen } from 'lucide-react'

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { name: 'الكتب', href: '/dashboard/books', icon: BookOpen },
  { name: 'محاور الكتب', href: '/dashboard/book-categories', icon: List },
  { name: 'المدفوعات', href: '/dashboard/payments', icon: CreditCard },
  { name: 'كوبونات الخصم', href: '/dashboard/coupons', icon: Ticket },
  { name: 'التقييمات', href: '/dashboard/evaluations', icon: FileText },
  { name: 'المستخدمين', href: '/dashboard/users', icon: Users },
  { name: 'الأدوار', href: '/dashboard/roles', icon: Shield },
  { name: 'الصلاحيات', href: '/dashboard/permissions', icon: Key },
  { name: 'الإشعارات', href: '/dashboard/notifications', icon: Bell },
  { name: 'التقارير', href: '/dashboard/reports', icon: FileText },
  { name: 'سجلات النشاط', href: '/dashboard/activity-logs', icon: Activity },
  { name: 'إعدادات النظام', href: '/dashboard/system-settings', icon: Settings },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { admin, adminLogout, checkAdminAuth } = useAdminAuth()

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!admin) return
      
      try {
        const response = await adminNotificationsAPI.getAll({ unreadOnly: 'true' })
        const notifications = response.data?.notifications || []
        const unread = Array.isArray(notifications) 
          ? notifications.filter(n => !n.isRead).length 
          : notifications.length // If already filtered, just count them
        setUnreadNotificationsCount(unread)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        // Don't show error toast for background updates
      }
    }

    if (admin) {
      fetchNotifications()
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      setUnreadNotificationsCount(0)
    }
  }, [admin])

  // Periodically check admin auth to prevent logout
  useEffect(() => {
    if (admin) {
      const authCheckInterval = setInterval(() => {
        checkAdminAuth()
      }, 60000) // Check every minute

      return () => clearInterval(authCheckInterval)
    }
  }, [admin, checkAdminAuth])
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    adminLogout()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black-950 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/images/logo.png" alt="نظام قيم" className="w-12 h-12 object-contain drop-shadow-lg" />
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl -z-10"></div>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight">لوحة التحكم</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">نظام قيم</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-xl shadow-primary-500/40 scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-lg hover:text-primary-500 dark:hover:text-primary-400 hover:scale-105'
                  } animate-slide-up opacity-0`}
                  style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                  )}
                  <div className={`ml-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? 'scale-110 text-white' : 'group-hover:scale-110 text-gray-700 dark:text-gray-300 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                    }`} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl ring-4 ring-primary-100">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
              <div className="mr-4 flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {admin?.name || 'مدير'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-primary-500 flex-shrink-0" />
                  <span className="truncate">{admin?.email || ''}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:via-red-700 hover:to-red-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:mr-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  لوحة التحكم
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  نظرة عامة على النظام
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary-500/20">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 w-32 placeholder-gray-500 dark:placeholder-gray-400"
                  dir="rtl"
                />
                <svg className="w-4 h-4 text-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 relative group"
                title={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Notifications */}
              <Link
                href="/dashboard/notifications"
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 group"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5 group-hover:animate-bounce" />
                {unreadNotificationsCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold px-1">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                    <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 rounded-full animate-ping opacity-75"></span>
                  </>
                )}
              </Link>

              {/* User menu */}
              <div className="flex items-center gap-3 pl-4 border-r border-gray-200 dark:border-gray-700 pr-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {admin?.name || 'مدير'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary-500" />
                    {admin?.role || 'ADMIN'}
                  </p>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-xl ring-4 ring-primary-100 hover:ring-primary-300 transition-all duration-300 hover:scale-110">
                    {admin?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-5rem)]">{children}</main>
      </div>
    </div>
  )
}

