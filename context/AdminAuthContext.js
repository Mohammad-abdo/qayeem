'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { adminAuthAPI } from '@/lib/adminApi'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

const AdminAuthContext = createContext({})

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    const adminToken = Cookies.get('adminToken')
    if (!adminToken) {
      setLoading(false)
      return
    }

    try {
      // Use adminAuthAPI which uses adminApi instance with proper interceptor
      const response = await adminAuthAPI.getCurrentUser()
      const user = response.data.user
      
      // Only allow ADMIN role
      if (user.role !== 'ADMIN') {
        Cookies.remove('adminToken')
        setAdmin(null)
        setLoading(false)
        return
      }
      
      setAdmin(user)
    } catch (error) {
      // Token is invalid or expired
      Cookies.remove('adminToken')
      setAdmin(null)
      // Only redirect if we're in dashboard
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email, password) => {
    try {
      // Use adminAuthAPI which doesn't have redirect interceptor
      const response = await adminAuthAPI.login({ email, password })
      const { token, user } = response.data
      
      // Only allow ADMIN role
      if (user.role !== 'ADMIN') {
        return {
          success: false,
          error: 'ليس لديك صلاحية للوصول إلى لوحة التحكم',
        }
      }
      
      // Use separate cookie for admin
      Cookies.set('adminToken', token, { expires: 7 })
      setAdmin(user)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'فشل تسجيل الدخول',
      }
    }
  }

  const adminLogout = () => {
    Cookies.remove('adminToken')
    setAdmin(null)
    router.push('/admin/login')
  }

  const updateAdmin = (userData) => {
    setAdmin((prev) => ({ ...prev, ...userData }))
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        adminLogin,
        adminLogout,
        updateAdmin,
        checkAdminAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

