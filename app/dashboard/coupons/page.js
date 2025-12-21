'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminCouponsAPI, adminUsersAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, Copy, CheckCircle, XCircle, Calendar, Percent, DollarSign, Users } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import Link from 'next/link'

export default function CouponsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const [coupons, setCoupons] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    descriptionAr: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    userId: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  })
  const { confirm } = useConfirm()

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  useEffect(() => {
    if (admin) {
      fetchCoupons()
      fetchUsers()
    }
  }, [admin, searchTerm, filterActive])

  const fetchUsers = async () => {
    try {
      const response = await adminUsersAPI.getAll({ limit: '1000' })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm) params.code = searchTerm
      if (filterActive !== '') params.isActive = filterActive
      
      const response = await adminCouponsAPI.getAll(params)
      setCoupons(response.data.coupons || [])
    } catch (error) {
      toast.error('فشل تحميل الكوبونات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editing) {
        await adminCouponsAPI.update(editing.id, formData)
        toast.success('تم تحديث الكوبون بنجاح')
      } else {
        await adminCouponsAPI.create(formData)
        toast.success('تم إضافة الكوبون بنجاح')
      }
      setShowForm(false)
      setEditing(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل حفظ الكوبون')
    }
  }

  const handleEdit = (coupon) => {
    setEditing(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      descriptionAr: coupon.descriptionAr || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || '',
      minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      userId: coupon.userId?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
      isActive: coupon.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا الكوبون؟', async () => {
      try {
        await adminCouponsAPI.delete(id)
        toast.success('تم حذف الكوبون بنجاح')
        fetchCoupons()
      } catch (error) {
        toast.error('فشل حذف الكوبون')
      }
    })
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      descriptionAr: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      userId: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    })
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('تم نسخ الكود')
  }

  const isCouponValid = (coupon) => {
    const now = new Date()
    if (!coupon.isActive) return false
    if (new Date(coupon.validFrom) > now) return false
    if (coupon.validUntil && new Date(coupon.validUntil) < now) return false
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false
    return true
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              إدارة كوبونات الخصم
            </h1>
            <p className="text-primary-100 text-lg">
              إنشاء وإدارة كوبونات الخصم للمستخدمين
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditing(null)
              setShowForm(true)
            }}
            className="px-6 py-3 bg-white text-primary-500 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 font-bold"
          >
            <Plus className="w-5 h-5" />
            إضافة كوبون جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-black-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              البحث بالكود
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                placeholder="ابحث بالكود..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black-500 mb-2">
              الحالة
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
            >
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black-500">
                {editing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                  resetForm()
                }}
                className="p-2 text-black-400 hover:text-black-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    كود الكوبون *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editing}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500 disabled:bg-gray-100"
                    placeholder="DISCOUNT10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    نوع الخصم *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED_AMOUNT">مبلغ ثابت (ر.س)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50'}
                  />
                  <p className="text-xs text-black-400 mt-1">
                    {formData.discountType === 'PERCENTAGE' ? 'نسبة من 0 إلى 100' : 'المبلغ بالريال السعودي'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    الحد الأدنى للشراء (ر.س)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                    placeholder="0"
                  />
                </div>

                {formData.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-black-500 mb-2">
                      الحد الأقصى للخصم (ر.س)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                      placeholder="لا يوجد حد"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    المستخدم المحدد (اختياري)
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  >
                    <option value="">جميع المستخدمين</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nameAr || user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    حد الاستخدام
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                    placeholder="غير محدود"
                  />
                  <p className="text-xs text-black-400 mt-1">
                    اتركه فارغاً للاستخدام غير المحدود
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    صالح من
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black-500 mb-2">
                    صالح حتى
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  />
                  <p className="text-xs text-black-400 mt-1">
                    اتركه فارغاً لعدم انتهاء الصلاحية
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  الوصف (إنجليزي)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  placeholder="Coupon description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black-500 mb-2">
                  الوصف (عربي)
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                  placeholder="وصف الكوبون"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-black-500">
                  نشط
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold"
                >
                  {editing ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    resetForm()
                  }}
                  className="px-6 py-3 bg-black-50 text-black-500 rounded-lg hover:bg-black-100 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-2xl shadow-xl border border-black-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">الكود</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">نوع الخصم</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">القيمة</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">الاستخدام</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">الصلاحية</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-black-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-black-400">
                    لا توجد كوبونات
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isValid = isCouponValid(coupon)
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black-500">{coupon.code}</span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 text-black-400 hover:text-primary-500"
                            title="نسخ الكود"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="w-4 h-4 text-primary-500" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-primary-500" />
                          )}
                          <span className="text-black-600">
                            {coupon.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary-500">
                          {coupon.discountValue}
                          {coupon.discountType === 'PERCENTAGE' ? '%' : ' ر.س'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.user ? (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-black-400" />
                            <span className="text-black-600">
                              {coupon.user.nameAr || coupon.user.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-black-400">الكل</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-black-600">
                          {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-black-400" />
                          <div>
                            <div className="text-black-600">
                              من: {new Date(coupon.validFrom).toLocaleDateString('ar-SA')}
                            </div>
                            {coupon.validUntil && (
                              <div className="text-black-600">
                                إلى: {new Date(coupon.validUntil).toLocaleDateString('ar-SA')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isValid ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-green-600 font-bold">صالح</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-500" />
                              <span className="text-red-600 font-bold">غير صالح</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




