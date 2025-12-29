"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Download, Share2 } from "lucide-react"

interface BookingSuccessProps {
  booking: any
}

export function BookingSuccess({ booking }: BookingSuccessProps) {
  const router = useRouter()

  const handleViewBookings = () => {
    router.push("/user/bookings")
  }

  const handleDownloadReceipt = () => {
    // Implement download receipt functionality
    console.log("Download receipt for booking:", booking.bookingNumber)
  }

  const handleShare = () => {
    // Implement share functionality
    console.log("Share booking:", booking.bookingNumber)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success Animation */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-4 animate-pulse">
            <CheckCircle className="w-14 h-14 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تم الحجز بنجاح!</h1>
          <p className="text-gray-600">تم تأكيد موعدك الطبي</p>
        </div>

        {/* Booking Details Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
            <p className="text-emerald-50 text-sm mb-2">رقم الحجز</p>
            <p className="text-3xl font-bold tracking-wider">#{booking.bookingNumber}</p>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-base">
                قيد الانتظار - Pending
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">الطبيب</span>
                <span className="font-semibold text-gray-900">
                  {booking.provider?.titleAr} {booking.provider?.nameAr}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">التاريخ</span>
                <span className="font-semibold text-gray-900">
                  {new Date(booking.date).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">الوقت</span>
                <span className="font-semibold text-gray-900">{booking.startTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">المبلغ</span>
                <span className="font-bold text-primary text-lg">{booking.totalPrice} جنيه</span>
              </div>
            </div>

            {/* Reminder */}
            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <p className="text-sm text-blue-800 text-center">
                <Calendar className="w-4 h-4 inline ml-1" />
                سيتم إرسال تذكير لك قبل الموعد بـ 24 ساعة
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleViewBookings} className="w-full" size="lg">
            عرض حجوزاتي
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownloadReceipt} className="bg-white">
              <Download className="w-4 h-4 ml-2" />
              تحميل الإيصال
            </Button>
            <Button variant="outline" onClick={handleShare} className="bg-white">
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">تعليمات مهمة:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• احضر قبل الموعد بـ 10 دقائق</li>
              <li>• أحضر بطاقة الهوية وأي تقارير طبية سابقة</li>
              <li>• يمكنك إلغاء أو تعديل الموعد حتى 24 ساعة قبل</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
