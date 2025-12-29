"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ProfileHeader from "@/components/profile-header"
import ProfileStats from "@/components/profile-stats"
import FloatingMedicalIcons from "@/components/floating-medical-icons"
import {
  ArrowRight,
  Package,
  CreditCard,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Gift,
  X,
  Stethoscope,
  FlaskConical,
  Loader2,
  Percent,
  Tag,
  AlertCircle,
  Truck,
  Copy,
  MapPin,
  Video,
} from "lucide-react"

interface UserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface StatsData {
  totalSpent: number
  completedOrders: number
  totalOrders: number
  loyaltyPoints: number
  savedAmount: number
  requiredForDiscount: number
  discountUnlocked: boolean
  progressPercentage: number
  remainingAmount: number
}

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  date: string
  status: string
  paymentStatus: string
  total: number
  items: OrderItem[]
  discountAmount: number
  discountCode: string | null
}

interface Discount {
  _id: string
  code: string
  name: string
  description: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number
  category: string
  endDate: string | null
}

interface Booking {
  id: string
  bookingNumber: string
  provider: {
    id: string
    nameAr: string
    specialtyAr: string
    image?: string
  }
  clinic?: { nameAr: string; address: string }
  hospital?: { nameAr: string; address: string }
  date: string
  startTime: string
  type: "clinic" | "hospital" | "online" | "home"
  totalPrice: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
}

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setStats(data.stats)
        setOrders(data.orders || [])
        setDiscounts(data.discounts || [])
      }

      const bookingsResponse = await fetch("/api/bookings")
      const bookingsData = await bookingsResponse.json()
      if (bookingsData.success) {
        setBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (updateData: Partial<UserData>) => {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    })
    const data = await response.json()
    if (data.success) {
      setUser((prev) => (prev ? { ...prev, ...data.user } : null))
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "shipped":
        return <Truck className="w-4 h-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "تم التسليم"
      case "processing":
        return "قيد المعالجة"
      case "shipped":
        return "قيد التوصيل"
      case "cancelled":
        return "ملغي"
      case "pending":
        return "في الانتظار"
      default:
        return "غير محدد"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const bookingStatusMap: { [key: string]: { label: string; color: string } } = {
    pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-700" },
    completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
    cancelled: { label: "ملغى", color: "bg-red-100 text-red-700" },
  }

  const bookingTypeMap: { [key: string]: { label: string; icon: any } } = {
    clinic: { label: "في العيادة", icon: MapPin },
    hospital: { label: "في المستشفى", icon: MapPin },
    online: { label: "أونلاين", icon: Video },
    home: { label: "زيارة منزلية", icon: MapPin },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative">
      <FloatingMedicalIcons />

      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 sm:p-3 min-h-[44px] touch-manipulation"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 xs:ml-2" />
            <span className="text-sm xs:text-base">العودة</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent min-h-[44px] px-3 xs:px-4 touch-manipulation"
            onClick={async () => {
              await signOut({ redirect: false })
              router.push("/login")
            }}
          >
            <span className="text-sm xs:text-base">خروج</span>
          </Button>
        </div>

        {/* Profile Header */}
        <ProfileHeader user={user} loading={loading} onUpdate={handleUpdateProfile} />

        {/* Profile Stats */}
        <ProfileStats stats={stats} loading={loading} />

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full mb-4 xs:mb-6 sm:mb-8 bg-gray-100 p-1 rounded-xl h-auto overflow-x-auto overflow-y-hidden flex-nowrap gap-0.5 xs:gap-1 scrollbar-hide">
                <TabsTrigger
                  value="overview"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 xs:px-3 sm:px-4 min-h-[44px] sm:min-h-[60px] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] xs:min-w-[80px] touch-manipulation"
                >
                  <User className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                  <span className="font-medium">نظرة عامة</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 xs:px-3 sm:px-4 min-h-[44px] sm:min-h-[60px] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] xs:min-w-[80px] touch-manipulation"
                >
                  <Package className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                  <span className="font-medium">الطلبات</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 xs:px-3 sm:px-4 min-h-[44px] sm:min-h-[60px] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] xs:min-w-[80px] touch-manipulation"
                >
                  <Calendar className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                  <span className="font-medium">الحجوزات</span>
                </TabsTrigger>
                <TabsTrigger
                  value="discounts"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 xs:px-3 sm:px-4 min-h-[44px] sm:min-h-[60px] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] xs:min-w-[80px] touch-manipulation"
                >
                  <CreditCard className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                  <span className="font-medium">أكواد الخصم</span>
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 xs:px-3 sm:px-4 min-h-[44px] sm:min-h-[60px] data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-lg transition-all text-[10px] xs:text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] xs:min-w-[80px] touch-manipulation"
                >
                  <Stethoscope className="w-3.5 xs:w-4 sm:w-5 h-3.5 xs:h-4 sm:h-5" />
                  <span className="font-medium">الخدمات</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 xs:space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                    {/* Personal Information */}
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          المعلومات الشخصية
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">الاسم الكامل:</span>
                            <span className="font-medium">{user ? `${user.firstName} ${user.lastName}` : "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">رقم الهاتف:</span>
                            <span className="font-medium">{user?.phone || "لم يتم إضافة"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <span className="font-medium text-sm">{user?.email || "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">العنوان:</span>
                            <span className="font-medium">{user?.address || "لم يتم إضافة"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          النشاط الأخير
                        </h3>
                        <div className="space-y-3">
                          {orders.length > 0 ? (
                            orders.slice(0, 3).map((order, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                                {getStatusIcon(order.status)}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">طلب #{order.orderNumber}</p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(order.date).toLocaleDateString("ar-EG")}
                                  </p>
                                </div>
                                <Badge className={`${getStatusColor(order.status)} border-0 text-xs`}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>لا توجد طلبات بعد</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 lg:col-span-2">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            الحجوزات القادمة
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 p-0 h-auto"
                            onClick={() => setActiveTab("bookings")}
                          >
                            عرض الكل
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length > 0 ? (
                            bookings
                              .filter((b) => ["pending", "confirmed"].includes(b.status))
                              .slice(0, 2)
                              .map((booking, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-purple-100"
                                >
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Stethoscope className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold">{booking.provider?.nameAr}</p>
                                    <p className="text-xs text-gray-600">
                                      {new Date(booking.date).toLocaleDateString("ar-EG")} - {booking.startTime}
                                    </p>
                                  </div>
                                  <Badge className={`${bookingStatusMap[booking.status]?.color} border-0 text-[10px]`}>
                                    {bookingStatusMap[booking.status]?.label}
                                  </Badge>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-4 text-gray-500 col-span-2">
                              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>لا توجد حجوزات قادمة</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">طلباتي</h3>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {orders.length} طلب
                  </Badge>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3 xs:space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 xs:p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h4 className="font-semibold text-lg">طلب #{order.orderNumber}</h4>
                                <Badge className={`${getStatusColor(order.status)} border-0`}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                  </div>
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.date).toLocaleDateString("ar-EG")}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  {order.items?.length || 0} منتج
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-emerald-600">
                                    {order.total?.toFixed(2) || 0} جنيه
                                  </span>
                                </div>
                              </div>

                              {order.discountCode && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <Tag className="w-4 h-4" />
                                  <span>
                                    كود خصم: {order.discountCode} (-{order.discountAmount} جنيه)
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDetails(true)
                              }}
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h4>
                      <p className="text-gray-600 mb-4">لم تقم بأي طلبات بعد</p>
                      <Button onClick={() => router.push("/user/home")} className="bg-emerald-600 hover:bg-emerald-700">
                        تصفح المنتجات
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">حجوزاتي الطبية</h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {bookings.length} حجز
                  </Badge>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map((booking) => {
                      const TypeIcon = bookingTypeMap[booking.type]?.icon || MapPin
                      return (
                        <Card key={booking.id} className="hover:shadow-md transition-all border-purple-100">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-50 shrink-0 border border-purple-100">
                                <img
                                  src={booking.provider?.image || "/placeholder.svg?height=64&width=64&query=doctor"}
                                  alt={booking.provider?.nameAr}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div>
                                    <h4 className="font-bold text-gray-900 truncate">{booking.provider?.nameAr}</h4>
                                    <p className="text-xs text-purple-600 font-medium">
                                      {booking.provider?.specialtyAr}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`${bookingStatusMap[booking.status]?.color} border-0 text-[10px] whitespace-nowrap`}
                                  >
                                    {bookingStatusMap[booking.status]?.label}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 mt-3">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                    {new Date(booking.date).toLocaleDateString("ar-EG")}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                                    {booking.startTime}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <TypeIcon className="w-3.5 h-3.5 text-purple-500" />
                                    {bookingTypeMap[booking.type]?.label}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                    {booking.totalPrice} ج.م
                                  </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-8 bg-transparent"
                                    onClick={() => router.push(`/user/bookings/${booking.id}`)}
                                  >
                                    التفاصيل
                                  </Button>
                                  {booking.status === "confirmed" && booking.type === "online" && (
                                    <Button size="sm" className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700">
                                      دخول المكالمة
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h4>
                      <p className="text-gray-600 mb-6">لم تقم بحجز أي مواعيد طبية بعد</p>
                      <Button
                        onClick={() => router.push("/user/clinics")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        احجز موعدك الأول
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Discount Codes Tab */}
              <TabsContent value="discounts" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">أكواد الخصم المتاحة</h3>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {discounts.length} كود
                  </Badge>
                </div>

                {!stats?.discountUnlocked ? (
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">أكواد الخصم مقفلة</h4>
                      <p className="text-gray-600 mb-4">
                        أنفق {stats?.remainingAmount?.toLocaleString() || 0} جنيه إضافي لفتح أكواد الخصم
                      </p>
                      <div className="max-w-xs mx-auto">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${stats?.progressPercentage || 0}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {stats?.totalSpent?.toLocaleString() || 0} /{" "}
                          {stats?.requiredForDiscount?.toLocaleString() || 0} جنيه
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : discounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discounts.map((discount) => (
                      <Card
                        key={discount._id}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {discount.discountType === "percentage"
                                  ? `${discount.discountValue}%`
                                  : discount.discountValue}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{discount.name}</h4>
                                <p className="text-sm text-gray-600">{discount.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            {discount.category && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Tag className="w-4 h-4" />
                                <span>{discount.category}</span>
                              </div>
                            )}
                            {discount.minOrderAmount > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Percent className="w-4 h-4" />
                                <span>الحد الأدنى: {discount.minOrderAmount} جنيه</span>
                              </div>
                            )}
                            {discount.endDate && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>صالح حتى: {new Date(discount.endDate).toLocaleDateString("ar-EG")}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 font-mono text-center">
                              {discount.code}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(discount.code)}
                              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              {copiedCode === discount.code ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="p-8 text-center">
                      <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد أكواد خصم</h4>
                      <p className="text-gray-600">لا توجد أكواد خصم متاحة حالياً</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Home Services Tab */}
              <TabsContent value="services" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">الخدمات المنزلية</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nurse Requests */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">طلبات الممرض</h4>
                          <p className="text-sm text-blue-700">تابع وإدارة طلبات الممرض المنزلي</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push("/user/nurse-requests")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        عرض الطلبات
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lab Test Requests */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FlaskConical className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-purple-900">طلبات التحليل</h4>
                          <p className="text-sm text-purple-700">تابع وإدارة طلبات التحليل المنزلي</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push("/user/lab-test")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        عرض الطلبات
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-emerald-900 mb-4">إجراءات سريعة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/user/nurse-requests")}
                        className="justify-start h-auto p-4 bg-white/50 hover:bg-white/80 border-emerald-300"
                      >
                        <div className="flex items-center gap-3">
                          <Stethoscope className="w-5 h-5 text-emerald-600" />
                          <div className="text-right">
                            <div className="font-medium text-emerald-900">طلب ممرض جديد</div>
                            <div className="text-sm text-emerald-700">احجز ممرض منزلي</div>
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/user/lab-test")}
                        className="justify-start h-auto p-4 bg-white/50 hover:bg-white/80 border-emerald-300"
                      >
                        <div className="flex items-center gap-3">
                          <FlaskConical className="w-5 h-5 text-emerald-600" />
                          <div className="text-right">
                            <div className="font-medium text-emerald-900">طلب تحليل جديد</div>
                            <div className="text-sm text-emerald-700">احجز تحليل منزلي</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">تفاصيل الطلب #{selectedOrder.orderNumber}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowOrderDetails(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Order Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">حالة الطلب</h4>
                    <p className="text-sm text-gray-600">
                      تم الطلب في {new Date(selectedOrder.date).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(selectedOrder.status)} border-0 text-[10px]`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusText(selectedOrder.status)}
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">المنتجات المطلوبة</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-emerald-600">{item.price} جنيه</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم ({selectedOrder.discountCode})</span>
                    <span>-{selectedOrder.discountAmount} جنيه</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">المجموع الكلي</span>
                  <span className="text-xl font-bold text-emerald-600">{selectedOrder.total?.toFixed(2)} جنيه</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" onClick={() => setShowOrderDetails(false)} className="w-full">
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
