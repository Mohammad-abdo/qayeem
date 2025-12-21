'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { booksAPI, paymentsAPI, couponsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { BookOpen, CreditCard, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    paymentMethod: 'VISA', // VISA, MASTERCARD, APPLE_PAY
    couponCode: '',
  })
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponValid, setCouponValid] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)

  useEffect(() => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً')
      router.push('/login')
      return
    }
    if (params.id) {
      fetchBook()
    }
  }, [params.id, user])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await booksAPI.getById(params.id)
      const bookData = response.data.book
      setBook(bookData)
      
      // Calculate initial price with book discount
      const originalPrice = parseFloat(bookData.price) || 0
      const bookDiscount = bookData.discountPercentage ? parseFloat(bookData.discountPercentage) : 0
      const priceAfterBookDiscount = bookDiscount > 0 
        ? originalPrice - (originalPrice * bookDiscount / 100)
        : originalPrice
      setFinalPrice(priceAfterBookDiscount)
    } catch (error) {
      toast.error('فشل تحميل بيانات الكتاب')
      router.push(`/library/${params.id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCoupon = async () => {
    if (!formData.couponCode.trim()) {
      toast.error('يرجى إدخال كود الكوبون')
      return
    }

    try {
      setCouponValidating(true)
      const originalPrice = parseFloat(book.price) || 0
      const bookDiscount = book.discountPercentage ? parseFloat(book.discountPercentage) : 0
      const priceAfterBookDiscount = bookDiscount > 0 
        ? originalPrice - (originalPrice * bookDiscount / 100)
        : originalPrice
      
      const response = await couponsAPI.validate(formData.couponCode, priceAfterBookDiscount)
      setCouponValid(true)
      setCouponDiscount(response.data.discountAmount)
      setFinalPrice(response.data.finalAmount)
      toast.success('تم تطبيق الكوبون بنجاح!')
    } catch (error) {
      setCouponValid(false)
      setCouponDiscount(0)
      const originalPrice = parseFloat(book.price) || 0
      const bookDiscount = book.discountPercentage ? parseFloat(book.discountPercentage) : 0
      const priceAfterBookDiscount = bookDiscount > 0 
        ? originalPrice - (originalPrice * bookDiscount / 100)
        : originalPrice
      setFinalPrice(priceAfterBookDiscount)
      toast.error(error.response?.data?.error || 'كود الكوبون غير صالح')
    } finally {
      setCouponValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.address.trim()) {
      toast.error('يرجى إدخال عنوان الاستلام')
      return
    }

    try {
      setSubmitting(true)
      
      // Map frontend payment methods to backend enum values
      const paymentMethodMap = {
        'VISA': 'CREDIT_CARD',
        'MASTERCARD': 'CREDIT_CARD',
        'APPLE_PAY': 'APPLE_PAY',
      };
      
      const paymentData = {
        bookId: parseInt(params.id),
        amount: finalPrice,
        currency: 'SAR',
        paymentMethod: paymentMethodMap[formData.paymentMethod] || 'CREDIT_CARD',
        couponCode: couponValid ? formData.couponCode : null,
        notes: `Address: ${formData.address}`,
        notesAr: `العنوان: ${formData.address}`,
      }

      const response = await paymentsAPI.create(paymentData)
      toast.success('تم تأكيد الطلب بنجاح!')
      
      // Redirect to success page or book details
      router.push(`/library/${params.id}?payment=success`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'فشل تأكيد الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* Header */}
      <Header currentPage={`/library/${params.id}/checkout`} />

      {/* Breadcrumb */}
      <div className="bg-primary-50 py-4 px-8 mt-24">
        <div className="max-w-7xl mx-auto">
          <Link href="/library" className="text-black-600 hover:text-primary-500">
            المكتبة
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <Link href={`/library/${params.id}`} className="text-black-600 hover:text-primary-500">
            تفاصيل الكتاب
          </Link>
          <span className="mx-2 text-black-600">/</span>
          <span className="text-black-500">تأكيد الطلب</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Book Info */}
          <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            <div className="bg-white rounded-lg shadow-md p-6 border border-black-100 mb-6 hover-lift transition-all duration-300">
              <h2 className="text-2xl font-bold text-black-500 mb-4">معلومات الكتاب</h2>
              <div className="flex gap-4">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black-500 mb-2">
                    {book.title || 'اسم الكتاب'}
                  </h3>
                  {book.titleAr && (
                    <p className="text-black-600 mb-4">{book.titleAr}</p>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      const originalPrice = parseFloat(book.price) || 0
                      const bookDiscount = book.discountPercentage ? parseFloat(book.discountPercentage) : 0
                      const hasBookDiscount = bookDiscount > 0
                      
                      return (
                        <>
                          {hasBookDiscount && (
                            <div className="flex items-center gap-2">
                              <span className="text-lg text-gray-500 line-through">
                                {originalPrice.toFixed(2)} ر.س
                              </span>
                              <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                خصم {bookDiscount}%
                              </span>
                            </div>
                          )}
                          <div className="text-3xl font-bold text-primary-500">
                            {finalPrice.toFixed(2)} ر.س
                          </div>
                          {couponValid && couponDiscount > 0 && (
                            <div className="text-sm text-green-600">
                              خصم إضافي من الكوبون: {couponDiscount.toFixed(2)} ر.س
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover-lift transition-all duration-300">
              <p className="text-black-600 mb-4">
                ننصح بإجراء التقييم قبل الشراء لتأكيد أن هذا الكتاب مناسب لك.
              </p>
              <Link
                href="/evaluation"
                className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400"
              >
                اجراء التقييم
              </Link>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-black-100 hover-lift transition-all duration-300">
              <h2 className="text-2xl font-bold text-black-500 mb-6">تأكيد الطلب</h2>

              {/* Coupon Code Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black-500 mb-2">
                  كود الكوبون (اختياري)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={(e) => {
                      setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
                      setCouponValid(null)
                      setCouponDiscount(0)
                    }}
                    className="flex-1 px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500 uppercase"
                    placeholder="أدخل كود الكوبون"
                  />
                  <button
                    type="button"
                    onClick={handleValidateCoupon}
                    disabled={couponValidating || !formData.couponCode.trim()}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponValidating ? '...' : 'تطبيق'}
                  </button>
                </div>
                {couponValid === false && (
                  <p className="text-sm text-red-500 mt-2">كود الكوبون غير صالح</p>
                )}
                {couponValid === true && (
                  <p className="text-sm text-green-600 mt-2">تم تطبيق الكوبون بنجاح!</p>
                )}
              </div>

              {/* Address Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black-500 mb-2">
                  العنوان بالتفصيل
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-black-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black-500"
                  placeholder="ادخل عنوان الاستلام بالتفصيل"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black-500 mb-4">
                  اختر طريقة الدفع
                </label>
                <div className="space-y-3">
                  {/* Mastercard */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 hover-scale">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MASTERCARD"
                      checked={formData.paymentMethod === 'MASTERCARD'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
                      <span className="text-black-500 font-medium">ماستر كارد</span>
                    </div>
                    {formData.paymentMethod === 'MASTERCARD' && (
                      <Check className="w-5 h-5 text-primary-500" />
                    )}
                  </label>

                  {/* Apple Pay */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 hover-scale">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="APPLE_PAY"
                      checked={formData.paymentMethod === 'APPLE_PAY'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-8 bg-black rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AP</span>
                      </div>
                      <span className="text-black-500 font-medium">أبل باي</span>
                    </div>
                    {formData.paymentMethod === 'APPLE_PAY' && (
                      <Check className="w-5 h-5 text-primary-500" />
                    )}
                  </label>

                  {/* Visa */}
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 hover-scale">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VISA"
                      checked={formData.paymentMethod === 'VISA'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <span className="text-black-500 font-medium">فيزا</span>
                    </div>
                    {formData.paymentMethod === 'VISA' && (
                      <Check className="w-5 h-5 text-primary-500" />
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-primary-500 text-white text-lg font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-scale hover-glow"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    تأكيد الطلب
                  </>
                )}
              </button>

              {/* Back Link */}
              <Link
                href={`/library/${params.id}`}
                className="block text-center mt-4 text-primary-500 hover:text-primary-400 flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                رجوع إلى تفاصيل الكتاب
              </Link>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
  <Footer />
    </div>
  )
}
