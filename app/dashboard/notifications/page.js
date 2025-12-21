'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminNotificationsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function NotificationsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  useEffect(() => {
    if (admin) {
      fetchNotifications()
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [admin])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await adminNotificationsAPI.getAll()
      // Handle different response formats
      const fetchedNotifications = response.data?.notifications || response.data || []
      setNotifications(Array.isArray(fetchedNotifications) ? fetchedNotifications : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Only show error toast on initial load (when notifications array is empty)
      setNotifications((prev) => {
        if (!prev || prev.length === 0) {
          toast.error('فشل تحميل الإشعارات')
        }
        return prev
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      // Use the PUT endpoint for marking as read
      await adminNotificationsAPI.markAsRead(id)
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      )
      toast.success('تم تحديد الإشعار كمقروء')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('فشل تحديث الإشعار')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Use the mark all as read endpoint
      await adminNotificationsAPI.markAllAsRead()
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      )
      toast.success('تم تحديد جميع الإشعارات كمقروءة')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('فشل تحديث الإشعارات')
    }
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا الإشعار؟', async () => {
      try {
        await adminNotificationsAPI.delete(id)
        setNotifications(notifications.filter((notif) => notif.id !== id))
        toast.success('تم حذف الإشعار')
      } catch (error) {
        toast.error('فشل حذف الإشعار')
      }
    })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-500">
            الإشعارات
          </h1>
          <p className="mt-2 text-black-600">
            {unreadCount > 0
              ? `لديك ${unreadCount} إشعار غير مقروء`
              : 'جميع الإشعارات مقروءة'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 focus:outline-none focus:ring-2 focus:ring-black-100 focus:ring-offset-2 transition-colors flex items-center"
          >
            <CheckCheck className="ml-2 w-5 h-5" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 text-center py-12">
          <Bell className="w-16 h-16 text-black-600 mx-auto mb-4" />
          <p className="text-black-600">
            لا توجد إشعارات
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-6 border border-black-100 ${
                !notification.isRead
                  ? 'border-r-4 border-primary-500 bg-primary-50/50'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-black-500">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    )}
                  </div>
                  {notification.titleAr && (
                    <p className="text-black-600 mb-2">
                      {notification.titleAr}
                    </p>
                  )}
                  <p className="text-black-600 mb-2">
                    {notification.message}
                  </p>
                  {notification.messageAr && (
                    <p className="text-black-600 mb-2">
                      {notification.messageAr}
                    </p>
                  )}
                  <p className="text-sm text-black-600">
                    {format(new Date(notification.createdAt), 'yyyy-MM-dd HH:mm', {
                      locale: arSA,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

