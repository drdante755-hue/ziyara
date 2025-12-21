"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Phone,
  Loader2,
  XCircle,
  Star,
  CreditCard,
} from "lucide-react"
import { toast } from "sonner"

interface BookingDetails {
  id: string
  bookingNumber: string
  provider: {
    id: string
    name: string
    nameAr: string
    specialtyAr: string
    image?: string
    phone?: string
  }
  clinic?: { nameAr: string; address: string; phone?: string }
  hospital?: { nameAr: string; address: string; phone?: string }
  patientName: string
  patientPhone: string
  patientAge?: number
  patientGender?: string
  date: string
  startTime: string
  endTime: string
  type: "clinic" | "hospital" | "online" | "home"
  address?: string
  symptoms?: string
  notes?: string
  price: number
  discountAmount: number
  totalPrice: number
  paymentMethod: string
  paymentStatus: string
  status: string
  rating?: number
  review?: string
  createdAt: string
}

const statusMap: { [key: string]: { label: string; color: string } } = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
}

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Rating state
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.booking)
      }
    } catch (error) {
      console.error("Error fetching booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancelReason }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("تم إلغاء الحجز بنجاح")
        setBooking({ ...booking!, status: "cancelled" })
        setCancelDialogOpen(false)
      } else {
        toast.error(data.error || "فشل في إلغاء الحجز")
      }
    } catch (error) {
      toast.error("حدث خطأ")
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("يرجى اختيار التقيم")
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          rating,
          comment: review,
          type: "provider",
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("شكراً لتقييمك!")
        setBooking({ ...booking!, rating, review })
        setReviewDialogOpen(false)
      } else {
        toast.error(data.error || "فشل في إرسال التقييم")
      }
    } catch (error) {
      toast.error("حدث خطأ")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">الحجز غير موجود</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  const typeInfo: { [key: string]: { label: string; icon: React.ReactNode } } = {
    clinic: { label: "في العيادة", icon: <MapPin className="w-5 h-5" /> },
    hospital: { label: "في المستشفى", icon: <MapPin className="w-5 h-5" /> },
    online: { label: "أونلاين", icon: <Video className="w-5 h-5" /> },
    home: { label: "زيارة منزلية", icon: <Home className="w-5 h-5" /> },
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/user/home')} className="text-primary-foreground">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">تفاصيل الحجز</h1>
            <p className="text-sm text-primary-foreground/80">#{booking.bookingNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">حالة الحجز</p>
              <Badge className={`mt-1 ${statusMap[booking.status].color}`}>{statusMap[booking.status].label}</Badge>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">المبلغ</p>
              <p className="text-xl font-bold text-primary">{booking.totalPrice} ج.م</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                <img
                  src={booking.provider.image || `/placeholder.svg?height=64&width=64&query=doctor`}
                  alt={booking.provider.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{booking.provider.nameAr}</h3>
                <p className="text-sm text-primary">{booking.provider.specialtyAr}</p>
                {booking.provider.phone && (
                  <a
                    href={`tel:${booking.provider.phone}`}
                    className="flex items-center gap-1 text-sm text-muted-foreground mt-1"
                  >
                    <Phone className="w-4 h-4" />
                    {booking.provider.phone}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">تفاصيل الموعد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التاريخ</p>
                <p className="font-medium">
                  {new Date(booking.date).toLocaleDateString("ar-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الوقت</p>
                <p className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {typeInfo[booking.type].icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نوع الموعد</p>
                <p className="font-medium">{typeInfo[booking.type].label}</p>
              </div>
            </div>

            {booking.address && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">{booking.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">بيانات المريض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium">{booking.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الهاتف</span>
              <span className="font-medium" dir="ltr">
                {booking.patientPhone}
              </span>
            </div>
            {booking.patientAge && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">العمر</span>
                <span className="font-medium">{booking.patientAge} سنة</span>
              </div>
            )}
            {booking.symptoms && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-1">الأعراض</p>
                <p>{booking.symptoms}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              معلومات الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">طريقة الدفع</span>
              <span className="font-medium">{booking.paymentMethod === "wallet" ? "المحفظة" : "كاش"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">حالة الدفع</span>
              <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
                {booking.paymentStatus === "paid" ? "مدفوع" : booking.paymentStatus === "refunded" ? "مسترد" : "معلق"}
              </Badge>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">المجموع</span>
              <span className="font-bold text-primary">{booking.totalPrice} ج.م</span>
            </div>
          </CardContent>
        </Card>

        {/* Rating (if completed) */}
        {booking.status === "completed" && booking.rating && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">تقييمك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < booking.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              {booking.review && <p className="text-sm text-muted-foreground">{booking.review}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        {booking.status === "pending" || booking.status === "confirmed" ? (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <XCircle className="w-5 h-5 ml-2" />
                إلغاء الحجز
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إلغاء الحجز</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من إلغاء هذا الحجز؟ سيتم استرداد المبلغ إلى محفظتك إذا كان مدفوعاً.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Textarea
                  placeholder="سبب الإلغاء (اختياري)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  تراجع
                </Button>
                <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد الإلغاء"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : booking.status === "completed" && !booking.rating ? (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Star className="w-5 h-5 ml-2" />
                قيم تجربتك
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>قيم الطبيب</DialogTitle>
                <DialogDescription>شاركنا رأيك في الخدمة المقدمة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                      <Star
                        className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="اكتب تعليقك (اختياري)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitReview} disabled={submittingReview || rating === 0}>
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال التقييم"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/user/doctors")}>
            احجز موعد جديد
          </Button>
        )}
      </div>
    </div>
  )
}
