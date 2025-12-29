"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Stethoscope, User, Calendar, Clock, CreditCard, MapPin, DollarSign } from "lucide-react"

interface BookingReviewProps {
  bookingData: {
    clinic: any
    service: any
    doctor: any
    date: string | null
    timeSlot: any
    paymentMethod: "cash" | "wallet"
  }
}

export function BookingReview({ bookingData }: BookingReviewProps) {
  const { clinic, service, doctor, date, timeSlot, paymentMethod } = bookingData

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة وتأكيد الحجز</h2>
        <p className="text-gray-600">راجع تفاصيل حجزك قبل التأكيد</p>
      </div>

      {/* Summary Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
          <h3 className="font-bold text-lg mb-1">ملخص الحجز</h3>
          <p className="text-emerald-50 text-sm">تأكد من صحة جميع المعلومات</p>
        </div>

        <CardContent className="p-0">
          {/* Clinic Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Building2 className="w-4 h-4" />
              <span>العيادة / المركز الطبي</span>
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={clinic?.images?.[0] || `/placeholder.svg?height=56&width=56&query=clinic`}
                  alt={clinic?.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{clinic?.nameAr}</p>
                {(clinic?.city || clinic?.area) && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{[clinic?.city, clinic?.area].filter(Boolean).join("، ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>الخدمة</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{service?.nameAr}</p>
              <Badge variant="secondary">{service?.duration} دقيقة</Badge>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <User className="w-4 h-4" />
              <span>الطبيب</span>
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={doctor?.image || `/placeholder.svg?height=56&width=56&query=doctor`}
                  alt={doctor?.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {doctor?.titleAr} {doctor?.nameAr}
                </p>
                <p className="text-sm text-emerald-600">{doctor?.specialtyAr}</p>
              </div>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>التاريخ</span>
                </div>
                <p className="font-bold text-gray-900">{date && formatDate(date)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>الوقت</span>
                </div>
                <p className="font-bold text-gray-900">
                  {timeSlot?.startTime} - {timeSlot?.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <CreditCard className="w-4 h-4" />
              <span>طريقة الدفع</span>
            </div>
            <p className="font-bold text-gray-900">
              {paymentMethod === "wallet" ? "المحفظة الإلكترونية" : "نقداً في العيادة"}
            </p>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-gray-700 font-medium">المبلغ الإجمالي</span>
              </div>
              <span className="text-2xl font-bold text-primary">{service?.price} جنيه</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">ملاحظة:</span> يرجى الحضور قبل موعدك بـ 10 دقائق. في حالة التأخير أكثر من 15
            دقيقة، قد يتم إلغاء الحجز تلقائياً.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
