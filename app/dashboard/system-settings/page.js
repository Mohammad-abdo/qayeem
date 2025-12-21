'use client'

import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { adminSettingsAPI } from '@/lib/adminApi'
import toast from 'react-hot-toast'
import { Save, Plus, Settings, Edit, Trash2 } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'

export default function SystemSettingsPage() {
  const { admin } = useAdminAuth()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const { confirm } = useConfirm()
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    valueAr: '',
    description: '',
    descriptionAr: '',
  })

  useEffect(() => {
    if (admin) {
      fetchSettings()
    }
  }, [admin])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminSettingsAPI.getAll()
      setSettings(response.data.settings || [])
    } catch (error) {
      toast.error('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editing) {
        await adminSettingsAPI.update(editing.id, formData)
        toast.success('تم تحديث الإعداد بنجاح')
      } else {
        await adminSettingsAPI.create(formData)
        toast.success('تم إضافة الإعداد بنجاح')
      }
      setEditing(null)
      setFormData({ key: '', value: '', valueAr: '', description: '', descriptionAr: '' })
      fetchSettings()
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل حفظ الإعداد')
    }
  }

  const handleEdit = (setting) => {
    setEditing(setting)
    setFormData({
      key: setting.key,
      value: setting.value,
      valueAr: setting.valueAr || '',
      description: setting.description || '',
      descriptionAr: setting.descriptionAr || '',
    })
  }

  const handleDelete = async (id) => {
    confirm('هل أنت متأكد من حذف هذا الإعداد؟', async () => {
      try {
        await adminSettingsAPI.delete(id)
        toast.success('تم حذف الإعداد بنجاح')
        fetchSettings()
      } catch (error) {
        toast.error('فشل حذف الإعداد')
      }
    })
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
              إعدادات النظام
            </h1>
            <p className="text-primary-100 text-lg">
              إدارة إعدادات النظام العامة
            </p>
          </div>
          <Settings className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-black-100">
        <h2 className="text-2xl font-bold text-black-500 mb-6">
          {editing ? 'تعديل الإعداد' : 'إضافة إعداد جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                المفتاح (Key) *
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                required
                disabled={!!editing}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500 disabled:bg-gray-100"
                placeholder="setting.key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                القيمة (Value) *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                placeholder="Value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-500 mb-2">
                القيمة (عربي)
              </label>
              <input
                type="text"
                value={formData.valueAr}
                onChange={(e) => setFormData({ ...formData, valueAr: e.target.value })}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                placeholder="القيمة بالعربي"
              />
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
                placeholder="Description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black-500 mb-2">
                الوصف (عربي)
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-black-500"
                placeholder="الوصف بالعربي"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-bold shadow-lg"
            >
              <Save className="w-5 h-5" />
              {editing ? 'حفظ التغييرات' : 'إضافة إعداد'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setFormData({ key: '', value: '', valueAr: '', description: '', descriptionAr: '' })
                }}
                className="px-6 py-3 bg-black-50 text-black-500 rounded-xl hover:bg-black-100 transition-colors font-semibold"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-black-100">
        <h2 className="text-2xl font-bold text-black-500 mb-6">
          الإعدادات الحالية
        </h2>
        {settings.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-black-600 mx-auto mb-4" />
            <p className="text-black-600">لا توجد إعدادات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => {
              const isRecommendationThreshold = setting.key === 'recommendation_threshold'
              const isDiscountSetting = setting.key === 'recommended_book_discount'
              return (
                <div
                  key={setting.id}
                  className={`border rounded-xl p-6 hover:shadow-lg transition-shadow ${
                    isRecommendationThreshold
                      ? 'border-green-500 bg-green-50'
                      : isDiscountSetting
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-black-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-bold ${
                          isRecommendationThreshold ? 'text-green-700' : isDiscountSetting ? 'text-blue-700' : 'text-black-500'
                        }`}>
                          {setting.key === 'recommendation_threshold' 
                            ? 'نسبة التوصية (الحد الأدنى)'
                            : setting.key === 'recommended_book_discount'
                            ? 'نسبة الخصم للكتب الموصى بها'
                            : setting.key}
                        </h3>
                        {(isRecommendationThreshold || isDiscountSetting) && (
                          <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                            isRecommendationThreshold ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            مهم
                          </span>
                        )}
                      </div>
                      <p className="text-black-600 mb-2">
                        <span className="font-semibold">القيمة:</span>{' '}
                        {(isRecommendationThreshold || isDiscountSetting) ? (
                          <span className={`font-bold text-xl ${
                            isRecommendationThreshold ? 'text-green-700' : 'text-blue-700'
                          }`}>{setting.value}%</span>
                        ) : (
                          setting.value
                        )}
                      </p>
                      {setting.valueAr && (
                        <p className="text-black-600 mb-2">
                          <span className="font-semibold">القيمة (عربي):</span> {setting.valueAr}
                        </p>
                      )}
                      {setting.description && (
                        <p className="text-sm text-black-600 mb-2">
                          {setting.description}
                        </p>
                      )}
                      {setting.descriptionAr && (
                        <p className="text-sm text-black-600">
                          {setting.descriptionAr}
                        </p>
                      )}
                      {isRecommendationThreshold && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 font-semibold">
                            💡 الكتب التي تتوافق بنسبة {setting.value}% أو أكثر سيتم تمييزها بحد أخضر في صفحة المقترحات
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className={`p-2 text-white rounded-lg hover:opacity-90 transition-colors ${
                          isRecommendationThreshold ? 'bg-green-600' : 'bg-blue-500'
                        }`}
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!isRecommendationThreshold && (
                        <button
                          onClick={() => handleDelete(setting.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
