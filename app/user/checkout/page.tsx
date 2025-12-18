"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  MapPin,
  User,
  CreditCard,
  Upload,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Loader2,
  Tag,
  Plus,
  Minus,
} from "lucide-react"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { InstapayIcon, VodafoneCashIcon, WalletIcon } from "@/components/icons/payment-icons"

interface AppliedDiscount {
  _id: string
  code: string
  discount: number
  type: "%" | "ج.م"
  description: string
  minOrder: number
  discountAmount: number
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart()

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
    referenceNumber: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("instapay")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [discountError, setDiscountError] = useState("")

  const [showRemovePopup, setShowRemovePopup] = useState(false)
  const [removedItemName, setRemovedItemName] = useState("")
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [walletBalance, setWalletBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchWalletBalance()
    }
  }, [session])

  async function fetchWalletBalance() {
    try {
      setWalletLoading(true)
      const res = await fetch("/api/wallet/balance")
      const data = await res.json()

      if (data.success) {
        setWalletBalance(data.balance || 0)
      } else {
        setWalletBalance(0)
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      setWalletBalance(0)
    } finally {
      setWalletLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateOriginalSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + ((item as any).originalPrice || item.price) * item.quantity, 0)
  }

  const calculateProductDiscount = () => {
    return cartItems.reduce((sum, item) => {
      const originalPrice = (item as any).originalPrice || item.price
      return sum + (originalPrice - item.price) * item.quantity
    }, 0)
  }

  const calculateCodeDiscount = () => {
    if (!appliedDiscount) return 0
    return appliedDiscount.discountAmount
  }

  const subtotal = calculateSubtotal()
  const originalSubtotal = calculateOriginalSubtotal()
  const productDiscount = calculateProductDiscount()
  const codeDiscount = calculateCodeDiscount()
  const deliveryFee = 0
  const total = subtotal - codeDiscount + deliveryFee

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("يرجى إدخال كود الخصم")
      return
    }

    setDiscountLoading(true)
    setDiscountError("")

    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotal }),
      })

      const data = await res.json()

      if (!res.ok) {
        setDiscountError(data.error)
        setAppliedDiscount(null)
      } else {
        setAppliedDiscount(data.discount)
        setDiscountError("")
      }
    } catch {
      setDiscountError("حدث خطأ في التحقق من الكود")
    } finally {
      setDiscountLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    setDiscountError("")
  }

  // Re-validate discount when subtotal changes
  useEffect(() => {
    if (appliedDiscount && subtotal < appliedDiscount.minOrder) {
      setDiscountError(`الحد الأدنى للطلب ${appliedDiscount.minOrder} ج.م`)
    } else if (appliedDiscount) {
      // Recalculate discount amount
      let newAmount = 0
      if (appliedDiscount.type === "%") {
        newAmount = (subtotal * appliedDiscount.discount) / 100
      } else {
        newAmount = appliedDiscount.discount
      }
      setAppliedDiscount({ ...appliedDiscount, discountAmount: newAmount })
      setDiscountError("")
    }
  }, [subtotal])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProof(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPaymentProofPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "رقم الهاتف مطلوب"
    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب"

    if (paymentMethod !== "wallet") {
      if (!formData.referenceNumber.trim()) newErrors.referenceNumber = "الرقم المرجعي مطلوب"
      if (!paymentProof) newErrors.paymentProof = "صورة إثبات الدفع مطلوبة"
    }

    if (paymentMethod === "wallet") {
      if (!session?.user) {
        newErrors.wallet = "يجب تسجيل الدخول للدفع بالرصيد"
      } else if (walletBalance < total) {
        newErrors.wallet = "رصيد المحفظة غير كافٍ"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRemoveItem = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId)
    if (item) {
      setItemToDelete({ id: item.id, name: item.name })
      setShowDeleteConfirmModal(true)
    }
  }

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      setIsDeleting(true)
      setShowDeleteConfirmModal(false)

      await new Promise((resolve) => setTimeout(resolve, 500))

      removeFromCart(itemToDelete.id)
      setRemovedItemName(itemToDelete.name)
      setShowRemovePopup(true)

      setTimeout(() => {
        setShowRemovePopup(false)
        setRemovedItemName("")
      }, 3000)

      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  const cancelDeleteItem = () => {
    setShowDeleteConfirmModal(false)
    setItemToDelete(null)
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    updateQuantity(itemId, newQuantity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    if (cartItems.length === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        originalPrice: (item as any).originalPrice,
        category: item.category,
        image: item.image,
        total: item.price * item.quantity,
      }))

      let finalPaymentMethod = paymentMethod
      if (paymentMethod === "instapay") {
        finalPaymentMethod = "InstaPay"
      } else if (paymentMethod === "vodafone") {
        finalPaymentMethod = "فودافون كاش"
      } else {
        finalPaymentMethod = "رصيد المحفظة"
      }

      const orderData = {
        customerName: formData.fullName,
        customerPhone: formData.phoneNumber,
        customerWhatsapp: formData.whatsappNumber || formData.phoneNumber,
        shippingAddress: formData.address,
        items: orderItems,
        subtotal,
        discountCode: appliedDiscount?.code,
        discountAmount: codeDiscount,
        discountType: appliedDiscount?.type,
        discountValue: appliedDiscount?.discount,
        total,
        paymentMethod: finalPaymentMethod,
        referenceNumber: paymentMethod === "wallet" ? "WALLET-PAYMENT" : formData.referenceNumber,
        paymentProofUrl: paymentMethod === "wallet" ? null : paymentProofPreview,
        paidWithWallet: paymentMethod === "wallet",
        userId: (session?.user as any)?.id || null,
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      clearCart()
      setOrderNumber(data.order.orderNumber)
      setOrderPlaced(true)

      if (paymentMethod === "wallet") {
        fetchWalletBalance()
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "حدث خطأ في إنشاء الطلب" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-0">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">تم إتمام الطلب بنجاح!</h2>
            <p className="text-gray-600 mb-4 text-center">جاري تنفيذ طلبك الآن...</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 w-full">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">وقت التوصيل المتوقع</span>
              </div>
              <p className="text-emerald-800 font-bold text-lg">سوف يصل الطلب خلال 30 دقيقة</p>
            </div>

            <div className="text-sm text-gray-500 mb-6 space-y-1">
              <p>
                رقم الطلب: <span className="font-mono font-bold text-gray-700">{orderNumber}</span>
              </p>
              <p>المبلغ المدفوع: {total.toFixed(2)} ج.م</p>
            </div>

            <Link href="/user/home" passHref className="w-full">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">العودة إلى الرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Order Summary - Right side on desktop */}
          <div className="lg:col-span-2 lg:order-2">
            <Card className="shadow-sm border-0 sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  ملخص الطلب ({getCartCount()} عناصر)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">السلة فارغة</h3>
                    <p className="text-sm text-gray-600 mb-4">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
                    <Link href="/user/home">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">تصفح المنتجات</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group relative">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border bg-white flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h3>
                            {item.category && (
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                                {item.category}
                              </span>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-emerald-600 text-sm">
                                {(item.price * item.quantity).toFixed(2)} ج.م
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 ml-2">الكمية:</span>
                                <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">كود الخصم</span>
                      </div>

                      {appliedDiscount ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
                                {appliedDiscount.code}
                              </span>
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                {appliedDiscount.discount}
                                {appliedDiscount.type} خصم
                              </Badge>
                            </div>
                            <button
                              onClick={handleRemoveDiscount}
                              className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="أدخل كود الخصم"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                            className="flex-1 font-mono text-sm h-10"
                          />
                          <Button
                            onClick={handleApplyDiscount}
                            disabled={discountLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4"
                          >
                            {discountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                          </Button>
                        </div>
                      )}

                      {discountError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {discountError}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>المجموع الفرعي</span>
                        <span>{originalSubtotal.toFixed(2)} ج.م</span>
                      </div>
                      {productDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>خصم المنتجات</span>
                          <span>- {productDiscount.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      {codeDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>خصم الكود ({appliedDiscount?.code})</span>
                          <span>- {codeDiscount.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>التوصيل</span>
                        <span className="text-emerald-600">مجاني</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>الإجمالي</span>
                        <span className="text-emerald-600">{total.toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form - Left side on desktop */}
          <div className="lg:col-span-3 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      className={`mt-1 ${errors.fullName ? "border-red-500" : ""}`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className={`mt-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
                      />
                      {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700">
                        رقم الواتساب (اختياري)
                      </Label>
                      <Input
                        id="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    عنوان التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      العنوان بالتفصيل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="المحافظة - المدينة - الشارع - رقم العمارة - الطابق - الشقة"
                      className={`mt-1 ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <label
                      htmlFor="instapay"
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "instapay"
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="instapay" id="instapay" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">InstaPay</div>
                        <div className="text-xs text-gray-500">الدفع عبر InstaPay</div>
                      </div>
                      <InstapayIcon className="w-10 h-10" />
                    </label>

                    <label
                      htmlFor="vodafone"
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "vodafone"
                          ? "border-red-500 bg-red-50 ring-2 ring-red-500/20"
                          : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="vodafone" id="vodafone" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">فودافون كاش</div>
                        <div className="text-xs text-gray-500">الدفع عبر Vodafone Cash</div>
                      </div>
                      <VodafoneCashIcon className="w-10 h-10" />
                    </label>

                    {session?.user && (
                      <label
                        htmlFor="wallet"
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                          walletBalance < total ? "opacity-60 cursor-not-allowed bg-gray-50" : "cursor-pointer"
                        } ${
                          paymentMethod === "wallet"
                            ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/20"
                            : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value="wallet" id="wallet" disabled={walletBalance < total} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">رصيد المحفظة</div>
                          <div className="text-xs text-gray-500">
                            الرصيد الحالي: {walletLoading ? "جاري التحميل..." : `${walletBalance.toFixed(2)} ج.م`}
                          </div>
                          {walletBalance < total && <div className="text-xs text-red-500 mt-1">الرصيد غير كافٍ</div>}
                        </div>
                        <WalletIcon className="w-10 h-10" />
                      </label>
                    )}
                  </RadioGroup>

                  {errors.wallet && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.wallet}
                    </p>
                  )}

                  {paymentMethod !== "wallet" && (
                    <>
                      <Separator />

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-2">تعليمات الدفع:</h4>
                        <p className="text-sm text-amber-700">
                          {paymentMethod === "instapay"
                            ? "قم بالتحويل إلى حساب InstaPay: 01000000000"
                            : "قم بالتحويل إلى رقم Vodafone Cash: 01000000000"}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="referenceNumber" className="text-sm font-medium text-gray-700">
                          الرقم المرجعي للعملية <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="referenceNumber"
                          value={formData.referenceNumber}
                          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                          placeholder="أدخل الرقم المرجعي"
                          className={`mt-1 ${errors.referenceNumber ? "border-red-500" : ""}`}
                        />
                        {errors.referenceNumber && (
                          <p className="text-xs text-red-500 mt-1">{errors.referenceNumber}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          صورة إثبات الدفع <span className="text-red-500">*</span>
                        </Label>
                        <div
                          className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            errors.paymentProof
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
                          }`}
                          onClick={() => document.getElementById("paymentProof")?.click()}
                        >
                          <input
                            type="file"
                            id="paymentProof"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          {paymentProofPreview ? (
                            <div className="space-y-2">
                              <img
                                src={paymentProofPreview || "/placeholder.svg"}
                                alt="إثبات الدفع"
                                className="max-h-40 mx-auto rounded-lg"
                              />
                              <p className="text-xs text-gray-500">اضغط لتغيير الصورة</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">اضغط لرفع صورة إثبات الدفع</p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG حتى 5MB</p>
                            </>
                          )}
                        </div>
                        {errors.paymentProof && <p className="text-xs text-red-500 mt-1">{errors.paymentProof}</p>}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري إتمام الطلب...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 ml-2" />
                    إتمام الطلب - {total.toFixed(2)} ج.م
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">حذف المنتج</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              هل أنت متأكد من حذف "{itemToDelete.name}" من السلة؟
            </p>
            <div className="flex gap-3">
              <Button onClick={cancelDeleteItem} variant="outline" className="flex-1 bg-transparent">
                إلغاء
              </Button>
              <Button onClick={confirmDeleteItem} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Popup */}
      {showRemovePopup && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
          <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">تم حذف "{removedItemName}" من السلة</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-xl">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-gray-700">جاري حذف المنتج...</span>
          </div>
        </div>
      )}
    </div>
  )
}
