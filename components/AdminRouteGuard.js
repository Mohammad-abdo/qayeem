'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'

export default function AdminRouteGuard({ children }) {
  const router = useRouter()
  const { admin, loading } = useAdminAuth()

  useEffect(() => {
    if (!loading) {
      if (!admin) {
        router.push('/admin/login')
      } else if (admin.role !== 'ADMIN') {
        router.push('/admin/login')
      }
    }
  }, [admin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!admin || admin.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}














