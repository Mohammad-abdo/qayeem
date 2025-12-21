import DashboardLayout from '@/components/DashboardLayout'
import AdminRouteGuard from '@/components/AdminRouteGuard'

export default function Layout({ children }) {
  return (
    <AdminRouteGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminRouteGuard>
  )
}


