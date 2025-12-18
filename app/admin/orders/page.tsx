"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  Eye,
  FileText,
  MapPin,
  Phone,
  User,
  Wallet,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Package,
  TrendingUp,
  Clock,
  Truck,
  ShoppingBag,
  XCircle,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrackingTimeline } from "@/components/tracking"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  originalPrice?: number
  category?: string
  image?: string
  total: number
}

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerWhatsapp?: string
  shippingAddress: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discountCode?: string
  discountAmount: number
  discountType?: "%" | "ج.م"
  discountValue?: number
  total: number
  status: "order_created" | "preparing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  referenceNumber?: string
  paymentProofUrl?: string
  notes?: string
  trackingId?: string
  createdAt: string
  updatedAt: string
  estimatedDeliveryDate?: Date
}

interface TrackingData {
  _id: string
  trackingNumber: string
  currentStatus: string
  statusHistory: any[]
  orderedStatuses: string[]
  currentStatusInfo: any
  assignedTo?: string
  assignedToPhone?: string
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  processingOrders: number
  deliveredOrders: number
  cancelledOrders: number
}

// Tracking statuses for product orders
const PRODUCT_ORDER_STATUSES = [
  { key: "order_created", label: "تم إنشاء الطلب" },
  { key: "payment_confirmed", label: "تم تأكيد الدفع" },
  { key: "preparing", label: "جاري التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "out_for_delivery", label: "في الطريق للتوصيل" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغى" },
]

const ORDERED_STATUSES = [
  "order_created",
  "payment_confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  })

  // Tracking states
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [selectedTrackingStatus, setSelectedTrackingStatus] = useState("")
  const [trackingNote, setTrackingNote] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [assignedToPhone, setAssignedToPhone] = useState("")
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false)
  const [showPaymentProof, setShowPaymentProof] = useState(false)
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<Date | null>(null)

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (appliedSearch) params.append("search", appliedSearch)
      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (selectedPaymentStatus !== "all") params.append("paymentStatus", selectedPaymentStatus)

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()

      if (data.orders) {
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      showAlert("error", "حدث خطأ في جلب الطلبات")
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, selectedStatus, selectedPaymentStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleSearch = () => {
    setAppliedSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Fetch tracking data for an order
  const fetchTracking = async (order: Order) => {
    setTrackingLoading(true)
    try {
      // Try to get existing tracking or create new one
      let response = await fetch(`/api/tracking?referenceType=product_order&referenceId=${order._id}`)
      let data = await response.json()

      if (!data.success) {
        // Create new tracking
        response = await fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceType: "product_order",
            referenceId: order._id,
            initialStatus: "order_created",
            note: "تم إنشاء الطلب",
          }),
        })
        data = await response.json()

        if (data.success) {
          // Fetch the full tracking data
          response = await fetch(`/api/tracking?referenceType=product_order&referenceId=${order._id}`)
          data = await response.json()
        }
      }

      if (data.success) {
        setTrackingData(data.data)
        setSelectedTrackingStatus(data.data.currentStatus)
        setAssignedTo(data.data.assignedTo || "")
        setAssignedToPhone(data.data.assignedToPhone || "")
      }
    } catch (error) {
      console.error("Error fetching tracking:", error)
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleOpenTracking = async (order: Order) => {
    setSelectedOrder(order)
    setShowTrackingDialog(true)
    await fetchTracking(order)
  }

  const handleUpdateTracking = async () => {
    if (!trackingData || !selectedTrackingStatus) return

    setIsUpdatingTracking(true)
    try {
      const response = await fetch(`/api/admin/tracking/${trackingData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedTrackingStatus,
          note: trackingNote,
          changedBy: "admin",
          assignedTo: assignedTo || undefined,
          assignedToPhone: assignedToPhone || undefined,
          estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم تحديث حالة التتبع بنجاح")
        setTrackingNote("")
        setEstimatedDeliveryDate(null)
        // Refresh tracking data
        if (selectedOrder) await fetchTracking(selectedOrder)
        // Refresh orders
        fetchOrders()
      } else {
        showAlert("error", data.error || "فشل في تحديث الحالة")
      }
    } catch (error) {
      showAlert("error", "حدث خطأ أثناء تحديث الحالة")
    } finally {
      setIsUpdatingTracking(false)
    }
  }

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error()

      setOrders(orders.map((o) => (o._id === id ? { ...o, status: newStatus as Order["status"] } : o)))
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] })
      }
      showAlert("success", "تم تحديث حالة الطلب")
    } catch {
      showAlert("error", "حدث خطأ في تحديث الحالة")
    }
  }

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })

      if (!res.ok) throw new Error()

      setOrders(orders.map((o) => (o._id === id ? { ...o, paymentStatus: newStatus as Order["paymentStatus"] } : o)))
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus as Order["paymentStatus"] })
      }
      showAlert("success", "تم تحديث حالة الدفع")
    } catch {
      showAlert("error", "حدث خطأ في تحديث حالة الدفع")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "order_created":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "shipped":
        return "bg-yellow-100 text-yellow-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const found = statuses.find((s) => s.value === status)
    return found ? found.label : status
  }

  const getPaymentStatusLabel = (status: string) => {
    const found = paymentStatuses.find((s) => s.value === status)
    return found ? found.label : status
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  const handleViewPaymentProof = (url: string) => {
    setSelectedProofUrl(url)
    setShowPaymentProof(true)
  }

  const statuses = [
    { value: "all", label: "الكل" },
    { value: "order_created", label: "تم استلام الطلب" },
    { value: "preparing", label: "جاري التجهيز" },
    { value: "shipped", label: "تم الشحن" },
    { value: "out_for_delivery", label: "جاري التوصيل" },
    { value: "delivered", label: "تم التوصيل" },
    { value: "cancelled", label: "ملغى" },
  ]

  const paymentStatuses = [
    { value: "all", label: "الكل" },
    { value: "pending", label: "في الانتظار" },
    { value: "paid", label: "مدفوع" },
    { value: "failed", label: "فشل" },
    { value: "refunded", label: "مسترد" },
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">إدارة الطلبات</h1>
        <p className="text-gray-600 mt-1">إجمالي الطلبات: {stats.totalOrders}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">إجمالي الطلبات</p>
                <p className="text-xl font-bold text-blue-800">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600">إجمالي الإيرادات</p>
                <p className="text-xl font-bold text-emerald-800">{stats.totalRevenue?.toFixed(2)} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600">طلبات جديدة</p>
                <p className="text-xl font-bold text-orange-800">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">قيد التجهيز</p>
                <p className="text-xl font-bold text-yellow-800">{stats.processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">مكتملة</p>
                <p className="text-xl font-bold text-green-800">{stats.deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600">ملغية</p>
                <p className="text-xl font-bold text-red-800">{stats.cancelledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">بحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث عن طلب أو رقم هاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة الطلب</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة الدفع</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Search className="w-4 h-4 ml-2" />
                بحث
              </Button>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setAppliedSearch("")
                  setSelectedStatus("all")
                  setSelectedPaymentStatus("all")
                }}
                variant="outline"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">رقم الطلب</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">العميل</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">رقم الهاتف</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">المبلغ</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">طريقة الدفع</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">التاريخ</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">حالة الطلب</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">حالة الدفع</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      لا توجد طلبات
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-800 font-medium font-mono">{order.orderNumber}</td>
                      <td className="py-4 px-6 text-gray-800">{order.customerName}</td>
                      <td className="py-4 px-6 text-gray-600 text-xs">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          {order.customerPhone}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-800 font-semibold">{order.total?.toFixed(2)} ج.م</td>
                      <td className="py-4 px-6 text-gray-600 text-xs">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">{order.paymentMethod}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          {statuses
                            .filter((s) => s.value !== "all")
                            .map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 cursor-pointer ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {paymentStatuses
                            .filter((s) => s.value !== "all")
                            .map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenTracking(order)}
                          className="p-2 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                          title="تتبع الطلب"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                          title="طباعة"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  تفاصيل الطلب {selectedOrder.orderNumber}
                </CardTitle>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    معلومات العميل
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        رقم الهاتف
                      </p>
                      <p className="font-medium text-gray-900">{selectedOrder.customerPhone}</p>
                    </div>
                    {selectedOrder.customerWhatsapp && (
                      <div>
                        <p className="text-sm text-gray-600">رقم الواتساب</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customerWhatsapp}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    عنوان التوصيل
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-teal-600" />
                  معلومات الدفع
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">طريقة الدفع</p>
                    <p className="font-bold text-emerald-700 text-lg">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">الرقم المرجعي</p>
                    <p className="font-bold text-blue-700 text-lg">{selectedOrder.referenceNumber || "-"}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">حالة الدفع</p>
                    <p
                      className={`font-bold text-lg ${getPaymentStatusColor(selectedOrder.paymentStatus).replace("bg-", "text-").replace("-100", "-700")}`}
                    >
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </p>
                  </div>
                </div>

                {selectedOrder.paymentProofUrl && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      إيصال الدفع
                    </p>
                    <div className="relative group">
                      <div
                        className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-amber-300 hover:border-amber-500 transition-colors"
                        onClick={() => handleViewPaymentProof(selectedOrder.paymentProofUrl!)}
                      >
                        <img
                          src={selectedOrder.paymentProofUrl || "/placeholder.svg"}
                          alt="إيصال الدفع"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            عرض بالحجم الكامل
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  المنتجات المطلوبة ({selectedOrder.items.length})
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-700">{item.price?.toFixed(2)} ج.م</p>
                        <p className="text-sm text-gray-600">الإجمالي: {item.total?.toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>المجموع الفرعي:</span>
                    <span>{selectedOrder.subtotal?.toFixed(2)} ج.م</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>الخصم:</span>
                      <span>-{selectedOrder.discountAmount?.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-700">
                    <span>رسوم التوصيل:</span>
                    <span>
                      {selectedOrder.shippingCost > 0 ? `${selectedOrder.shippingCost?.toFixed(2)} ج.م` : "مجاني"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                  <span className="text-lg font-semibold text-gray-900">إجمالي الطلب:</span>
                  <span className="text-2xl font-bold text-emerald-700">{selectedOrder.total?.toFixed(2)} ج.م</span>
                </div>
              </div>

              <Button
                onClick={() => setShowDetails(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                إغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showPaymentProof && selectedProofUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowPaymentProof(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowPaymentProof(false)}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedProofUrl || "/placeholder.svg"}
              alt="إيصال الدفع"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
                فتح في نافذة جديدة
              </a>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-purple-600" />
              تتبع الطلب {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {trackingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : trackingData ? (
            <div className="space-y-6">
              {/* Tracking Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">مسار الطلب</h4>
                <TrackingTimeline
                  currentStatus={trackingData.currentStatus}
                  statusHistory={trackingData.statusHistory}
                  orderedStatuses={trackingData.orderedStatuses || ORDERED_STATUSES}
                  referenceType="product_order"
                  variant="vertical"
                  showDetails={true}
                />
              </div>

              {/* Update Status */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">تحديث الحالة</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الحالة الجديدة</Label>
                    <Select value={selectedTrackingStatus} onValueChange={setSelectedTrackingStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.key} value={status.key}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>مسؤول التوصيل (اختياري)</Label>
                    <Input
                      placeholder="اسم مسؤول التوصيل"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم هاتف المسؤول (اختياري)</Label>
                    <Input
                      placeholder="رقم الهاتف"
                      value={assignedToPhone}
                      onChange={(e) => setAssignedToPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ملاحظة (اختياري)</Label>
                  <Textarea
                    placeholder="أضف ملاحظة للعميل..."
                    value={trackingNote}
                    onChange={(e) => setTrackingNote(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ التسليم المتوقع (اختياري)</Label>
                  <DatePicker
                    selected={estimatedDeliveryDate}
                    onChange={(date: Date | null) => setEstimatedDeliveryDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات تتبع</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>
              إغلاق
            </Button>
            <Button
              onClick={handleUpdateTracking}
              disabled={isUpdatingTracking || !trackingData}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdatingTracking ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تحديث الحالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
