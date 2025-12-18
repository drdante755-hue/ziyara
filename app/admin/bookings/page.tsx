"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, RefreshCw, CalendarCheck, Eye, X, Clock, User, Phone, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface Booking {
  _id: string
  id?: string
  bookingNumber: string
  patient?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  provider?: {
    _id?: string
    id?: string
    name: string
    nameAr?: string
    title?: string
    specialty?: string | { name: string }
    specialtyAr?: string
  }
  slot?: {
    _id: string
    date: string
    startTime: string
    endTime: string
  }
  date?: string
  startTime?: string
  endTime?: string
  appointmentType?: string
  type?: string
  status: string
  patientInfo?: {
    name: string
    phone: string
    age?: number
    gender?: string
    notes?: string
  }
  patientName?: string
  patientPhone?: string
  pricing?: {
    consultationFee: number
    discount: number
    totalAmount: number
  }
  price?: number
  totalPrice?: number
  discountAmount?: number
  payment?: {
    method: string
    status: string
  }
  paymentMethod?: string
  paymentStatus?: string
  cancellation?: {
    reason: string
    cancelledAt: string
    cancelledBy: string
  }
  createdAt: string
}

const statusOptions = [
  { value: "الكل", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكد" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "no_show", label: "لم يحضر" },
]

const appointmentTypeLabels: Record<string, string> = {
  clinic: "في العيادة",
  home_visit: "زيارة منزلية",
  online: "استشارة أونلاين",
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

const paymentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  refunded: "مسترد",
  failed: "فشل",
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("الكل")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedStatus !== "الكل") params.append("status", selectedStatus)

      const response = await fetch(`/api/bookings?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const bookingsData = result.data || result.bookings || []
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب الحجوزات", "error")
        setBookings([])
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedStatus])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم تحديث حالة الحجز بنجاح", "success")
        fetchBookings()
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus })
        }
      } else {
        showAlert(result.error || "حدث خطأ أثناء تحديث الحالة", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, d MMMM yyyy", { locale: ar })
    } catch {
      return dateString
    }
  }

  const getPatientName = (booking: Booking) => {
    return booking.patientInfo?.name || booking.patientName || "غير محدد"
  }

  const getPatientPhone = (booking: Booking) => {
    return booking.patientInfo?.phone || booking.patientPhone || ""
  }

  const getProviderName = (booking: Booking) => {
    return booking.provider?.name || booking.provider?.nameAr || "غير محدد"
  }

  const getProviderSpecialty = (booking: Booking) => {
    if (!booking.provider?.specialty) return ""
    if (typeof booking.provider.specialty === "string") return booking.provider.specialty
    return booking.provider.specialty.name || booking.provider.specialtyAr || ""
  }

  const getBookingDate = (booking: Booking) => {
    return booking.slot?.date || booking.date || ""
  }

  const getBookingTime = (booking: Booking) => {
    return booking.slot?.startTime || booking.startTime || ""
  }

  const getAppointmentType = (booking: Booking) => {
    return booking.appointmentType || booking.type || "clinic"
  }

  const getTotalAmount = (booking: Booking) => {
    return booking.pricing?.totalAmount || booking.totalPrice || booking.price || 0
  }

  const getPaymentMethod = (booking: Booking) => {
    return booking.payment?.method || booking.paymentMethod || "cash"
  }

  const getPaymentStatus = (booking: Booking) => {
    return booking.payment?.status || booking.paymentStatus || "pending"
  }

  const getBookingId = (booking: Booking) => {
    return booking._id || booking.id || ""
  }

  const DetailsModal = () => {
    if (!selectedBooking) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">تفاصيل الحجز</h3>
              <p className="text-sm text-muted-foreground">#{selectedBooking.bookingNumber}</p>
            </div>
            <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الحالة الحالية</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedBooking.status] || "bg-gray-100"}`}
                >
                  {statusLabels[selectedBooking.status] || selectedBooking.status}
                </span>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap gap-2">
                {selectedBooking.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(getBookingId(selectedBooking), "confirmed")}
                    disabled={updatingStatus}
                  >
                    تأكيد الحجز
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(getBookingId(selectedBooking), "completed")}
                      disabled={updatingStatus}
                    >
                      إتمام الحجز
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(getBookingId(selectedBooking), "no_show")}
                      disabled={updatingStatus}
                    >
                      لم يحضر
                    </Button>
                  </>
                )}
                {["pending", "confirmed"].includes(selectedBooking.status) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUpdateStatus(getBookingId(selectedBooking), "cancelled")}
                    disabled={updatingStatus}
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </div>

            {/* Provider Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                الطبيب
              </h4>
              <div className="p-4 border rounded-lg">
                <p className="font-medium">{getProviderName(selectedBooking)}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.provider?.title} - {getProviderSpecialty(selectedBooking)}
                </p>
              </div>
            </div>

            {/* Appointment Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                موعد الحجز
              </h4>
              <div className="p-4 border rounded-lg space-y-2">
                <p>{getBookingDate(selectedBooking) ? formatDate(getBookingDate(selectedBooking)) : "غير محدد"}</p>
                <p className="text-sm" dir="ltr">
                  {getBookingTime(selectedBooking)} - {selectedBooking.slot?.endTime || selectedBooking.endTime || ""}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">نوع الموعد: </span>
                  {appointmentTypeLabels[getAppointmentType(selectedBooking)] || getAppointmentType(selectedBooking)}
                </p>
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                بيانات المريض
              </h4>
              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-medium">{getPatientName(selectedBooking)}</p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span dir="ltr">{getPatientPhone(selectedBooking)}</span>
                </p>
                {selectedBooking.patientInfo?.age && (
                  <p className="text-sm">العمر: {selectedBooking.patientInfo.age} سنة</p>
                )}
                {selectedBooking.patientInfo?.gender && (
                  <p className="text-sm">الجنس: {selectedBooking.patientInfo.gender === "male" ? "ذكر" : "أنثى"}</p>
                )}
                {selectedBooking.patientInfo?.notes && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">ملاحظات: </span>
                    {selectedBooking.patientInfo.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                الدفع
              </h4>
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر الكشف</span>
                  <span>{selectedBooking.pricing?.consultationFee || selectedBooking.price || 0} جنيه</span>
                </div>
                {(selectedBooking.pricing?.discount || selectedBooking.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>-{selectedBooking.pricing?.discount || selectedBooking.discountAmount || 0} جنيه</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>الإجمالي</span>
                  <span>{getTotalAmount(selectedBooking)} جنيه</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">طريقة الدفع</span>
                  <span>{getPaymentMethod(selectedBooking) === "wallet" ? "المحفظة" : "نقدي"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">حالة الدفع</span>
                  <span>
                    {paymentStatusLabels[getPaymentStatus(selectedBooking)] || getPaymentStatus(selectedBooking)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Info */}
            {selectedBooking.cancellation && (
              <div>
                <h4 className="font-semibold mb-3 text-red-600">معلومات الإلغاء</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">السبب: </span>
                    {selectedBooking.cancellation.reason}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">تاريخ الإلغاء: </span>
                    {formatDate(selectedBooking.cancellation.cancelledAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Created At */}
            <p className="text-xs text-muted-foreground text-center">
              تم إنشاء الحجز: {formatDate(selectedBooking.createdAt)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return (
    <div className="space-y-6">
      {alert.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" />
            الحجوزات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة ومتابعة حجوزات المواعيد</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الحجز أو اسم المريض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background min-w-[150px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchBookings} className="gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد حجوزات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-right p-3 font-medium">رقم الحجز</th>
                <th className="text-right p-3 font-medium">المريض</th>
                <th className="text-right p-3 font-medium">الطبيب</th>
                <th className="text-right p-3 font-medium">الموعد</th>
                <th className="text-right p-3 font-medium">النوع</th>
                <th className="text-right p-3 font-medium">المبلغ</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={getBookingId(booking)} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-mono text-sm">{booking.bookingNumber}</td>
                  <td className="p-3">
                    <p className="font-medium">{getPatientName(booking)}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {getPatientPhone(booking)}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{getProviderName(booking)}</p>
                    <p className="text-sm text-muted-foreground">{getProviderSpecialty(booking)}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm">{getBookingDate(booking) ? formatDate(getBookingDate(booking)) : "-"}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {getBookingTime(booking)}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">
                      {appointmentTypeLabels[getAppointmentType(booking)] || getAppointmentType(booking)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{getTotalAmount(booking)} جنيه</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[booking.status] || "bg-gray-100"}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(booking)} className="gap-1">
                      <Eye className="w-4 h-4" />
                      عرض
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && <DetailsModal />}
    </div>
  )
}
