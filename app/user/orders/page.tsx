"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowRight,
  XCircle,
  Package,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  LogIn,
  ShoppingBag,
} from "lucide-react"
import { OrderTrackingTimeline } from "@/components/order-tracking-timeline"
import type { AllStatuses } from "@/utils/order-status"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  image?: string
}

interface Order {
  displayStatus: string
  _id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  shippingAddress: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discountCode?: string
  discountAmount: number
  total: number
  status:
    | "pending"
    | "processing"
    | "order_created"
    | "payment_confirmed"
    | "preparing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "cancelled"
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentConfirmedBy?: string
  paymentConfirmedAt?: string
  notes?: string
  estimatedDeliveryDate?: string
  createdAt: string
  updatedAt: string
  trackingId?: {
    _id: string
    trackingNumber: string
    currentStatus: string
    statusHistory: any[]
    referenceType: string
  }
}

const getStatusMessage = (status: string) => {
  const messages: Record<string, { title: string; subtitle: string }> = {
    pending: { title: "تم استلام طلبك", subtitle: "طلبك قيد المراجعة وسيتم تجهيزه قريباً" },
    order_created: { title: "تم استلام طلبك", subtitle: "طلبك قيد المراجعة وسيتم تجهيزه قريباً" },
    processing: { title: "جاري معالجة الطلب", subtitle: "يتم مراجعة طلبك" },
    payment_confirmed: { title: "تم تأكيد الدفع", subtitle: "تم تأكيد الدفع وسيتم تجهيز طلبك" },
    preparing: { title: "جاري تجهيز طلبك", subtitle: "طلبك في مرحلة التجهيز والتغليف" },
    shipped: { title: "تم شحن طلبك", subtitle: "تم تسليم طلبك لشركة الشحن" },
    out_for_delivery: { title: "جاري التوصيل", subtitle: "مندوب التوصيل في الطريق إليك" },
    delivered: { title: "تم التوصيل", subtitle: "تم توصيل طلبك بنجاح" },
    completed: { title: "تم التوصيل", subtitle: "تم توصيل طلبك بنجاح" },
    cancelled: { title: "تم إلغاء الطلب", subtitle: "تم إلغاء هذا الطلب" },
  }
  return messages[status] || messages.pending
}

export default function UserOrdersPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/orders?userId=${session.user.id}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const ordersWithStatus = data.orders.map((order: any) => {
            const effectiveStatus = order.trackingId?.currentStatus || order.status
            return {
              ...order,
              displayStatus: effectiveStatus,
            }
          })
          setOrders(ordersWithStatus)
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("فشل في الاتصال بالخادم")
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (mounted && sessionStatus === "authenticated" && session?.user?.id) {
      fetchOrders()
    } else if (mounted && sessionStatus === "unauthenticated") {
      setIsLoading(false)
    }
  }, [fetchOrders, sessionStatus, session?.user?.id, mounted])

  useEffect(() => {
    if (!mounted || sessionStatus !== "authenticated" || !session?.user?.id) return

    fetchOrders()

    const interval = setInterval(() => {
      fetchOrders()
    }, 10000)

    return () => clearInterval(interval)
  }, [mounted, sessionStatus, session?.user?.id])

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const OrderCard = ({ order }: { order: Order }) => {
    const isExpanded = expandedOrders.has(order._id)
    const statusInfo = getStatusMessage(order.displayStatus || order.status)
    const isActive = [
      "pending",
      "order_created",
      "processing",
      "payment_confirmed",
      "preparing",
      "shipped",
      "out_for_delivery",
    ].includes(order.displayStatus || order.status)

    return (
      <Card className={`overflow-hidden border ${isActive ? "border-sky-200 shadow-md" : "border-gray-200"}`}>
        <div
          className={`p-4 cursor-pointer transition-colors ${isActive ? "bg-sky-50/50" : "bg-gray-50"}`}
          onClick={() => toggleOrderExpansion(order._id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className={`text-lg font-bold ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                  {statusInfo.title}
                </p>
                <p className="text-sm text-gray-500">طلب رقم: {order.orderNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                  >
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="text-sky-600">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t">
            <div className="p-6 bg-white">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{statusInfo.title}</h3>
                <p className="text-gray-600 mt-1">{statusInfo.subtitle}</p>
              </div>

              <OrderTrackingTimeline
                status={(order.trackingId?.currentStatus || order.status) as AllStatuses}
                referenceType="product_order"
                paymentStatus={order.paymentStatus}
                paymentConfirmedBy={order.paymentConfirmedBy}
                paymentConfirmedAt={order.paymentConfirmedAt}
                variant="horizontal"
                showPaymentBadge={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50">
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-bold text-gray-900 mb-3 text-center">معلومات الطلب</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">عدد المنتجات:</span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">الإجمالي:</span>
                      <span className="font-bold text-emerald-600">{order.total.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">طريقة الدفع:</span>
                      <span>
                        {order.paymentMethod === "cash"
                          ? "نقدي"
                          : order.paymentMethod === "wallet"
                            ? "المحفظة"
                            : order.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium"
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowDetailsDialog(true)
                    }}
                  >
                    عرض تفاصيل الطلب
                  </button>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-bold text-gray-900 mb-3 text-center">عنوان الشحن</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-gray-600 leading-relaxed">{order.shippingAddress}</p>
                    <p className="text-gray-500 pt-2" dir="ltr">
                      {order.customerPhone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-bold text-gray-900 mb-3 text-center">معلومات التوصيل</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">رقم الطلب:</span>
                      <span className="font-mono mr-1">{order.orderNumber}</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">تاريخ الطلب:</span>
                      <span className="mr-1">{formatDate(order.createdAt)}</span>
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.displayStatus !== "delivered" &&
                      order.displayStatus !== "completed" &&
                      order.displayStatus !== "cancelled" && (
                        <button className="w-full flex items-center justify-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium">
                          <ExternalLink className="w-4 h-4" />
                          تحديث تعليمات التسليم
                        </button>
                      )}
                    {(order.displayStatus === "pending" || order.displayStatus === "order_created") && (
                      <button className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        إلغاء عملية التسليم
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Card>
    )
  }

  const OrdersSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (!mounted || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" suppressHydrationWarning>
        <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (sessionStatus === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" suppressHydrationWarning>
        <Card className="w-full max-w-md border shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-sky-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-6">لمتابعة طلباتك ومشترياتك، يرجى تسجيل الدخول إلى حسابك</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/login?callbackUrl=/user/orders")}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                <LogIn className="w-5 h-5 ml-2" />
                تسجيل الدخول
              </Button>
              <p className="text-sm text-gray-500">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-sky-600 hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8" suppressHydrationWarning>
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-3 xs:px-4 py-3 xs:py-4">
          <div className="flex justify-between items-center gap-2 xs:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg xs:text-xl font-bold text-gray-900 truncate">طلباتي</h1>
              <p className="text-xs xs:text-sm text-gray-500 truncate">
                مرحباً {session.user.name || "بك"}، تابع حالة طلباتك
              </p>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={isLoading}
                className="text-sky-600 border-sky-200 hover:bg-sky-50 bg-transparent min-h-[40px] px-2 xs:px-3 touch-manipulation"
              >
                <RefreshCw className={`w-3.5 xs:w-4 h-3.5 xs:h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-1.5 xs:ml-2 text-xs xs:text-sm">تحديث</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 min-h-[40px] px-2 xs:px-3 touch-manipulation"
              >
                <ArrowRight className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
                <span className="hidden xs:inline ml-1.5 xs:ml-2 text-xs xs:text-sm">العودة</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 xs:px-4 py-4 xs:py-6 max-w-4xl">
        {isLoading && <OrdersSkeleton />}

        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-medium">{error}</p>
              <Button
                variant="outline"
                onClick={fetchOrders}
                className="mt-4 text-red-600 border-red-300 hover:bg-red-100 bg-transparent"
              >
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات بعد</h3>
              <p className="text-gray-500 mb-6">ابدأ التسوق الآن واستمتع بأفضل العروض</p>
              <Button onClick={() => router.push("/pharmacy")} className="bg-sky-600 hover:bg-sky-700">
                <ShoppingCart className="w-5 h-5 ml-2" />
                تصفح المنتجات
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل الطلب #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-3">المنتجات</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {item.price.toFixed(2)} ج.م
                        </p>
                      </div>
                      <p className="font-bold text-emerald-600">{item.total.toFixed(2)} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">ملخص الطلب</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">المجموع الفرعي:</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الشحن:</span>
                    <span>{selectedOrder.shippingCost.toFixed(2)} ج.م</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>الخصم:</span>
                      <span>-{selectedOrder.discountAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span className="text-emerald-600">{selectedOrder.total.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
