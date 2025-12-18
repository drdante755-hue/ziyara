"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Wallet,
  Banknote,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

interface Provider {
  id: string
  nameAr: string
  titleAr: string
  specialtyAr: string
  image?: string
  gender: "male" | "female"
  consultationFee: number
  homeVisitFee?: number
  onlineConsultationFee?: number
  availableForHomeVisit: boolean
  availableForOnline: boolean
}

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  type: "clinic" | "hospital" | "online" | "home"
  price: number
  status: string
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { data: session } = useSession()

  const [doctor, setDoctor] = useState<Provider | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [appointmentType, setAppointmentType] = useState<"clinic" | "online" | "home">("clinic")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState<"male" | "female">("male")
  const [address, setAddress] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">("cash")

  // Generate dates for next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" }),
      dayName: date.toLocaleDateString("ar-EG", { weekday: "long" }),
    }
  })

  useEffect(() => {
    fetchDoctor()
  }, [id])

  useEffect(() => {
    if (selectedDate) {
      fetchSlots()
    }
  }, [selectedDate, appointmentType])

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/providers/${id}`)
      const data = await res.json()
      if (data.success) {
        setDoctor(data.provider)
      }
    } catch (error) {
      console.error("Error fetching doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    try {
      const res = await fetch(
        `/api/slots?providerId=${id}&date=${selectedDate}&type=${appointmentType}&status=available`,
      )
      const data = await res.json()
      if (data.success) {
        setSlots(data.slots)
      }
    } catch (error) {
      console.error("Error fetching slots:", error)
    }
  }

  const handleSubmit = async () => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً")
      router.push("/login")
      return
    }

    if (!selectedSlot) {
      toast.error("يرجى اختيار موعد")
      return
    }

    if (!patientName || !patientPhone) {
      toast.error("يرجى ملء جميع البيانات المطلوبة")
      return
    }

    if (appointmentType === "home" && !address) {
      toast.error("يرجى إدخال العنوان للزيارة المنزلية")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          patientName,
          patientPhone,
          patientAge: patientAge ? Number.parseInt(patientAge) : undefined,
          patientGender,
          address: appointmentType === "home" ? address : undefined,
          symptoms,
          paymentMethod,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("تم الحجز بنجاح!")
        router.push(`/user/bookings/${data.booking.id}`)
      } else {
        toast.error(data.error || "فشل في إتمام الحجز")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("حدث خطأ أثناء الحجز")
    } finally {
      setSubmitting(false)
    }
  }

  const getPrice = () => {
    if (!doctor) return 0
    switch (appointmentType) {
      case "online":
        return doctor.onlineConsultationFee ?? doctor.consultationFee ?? 0
      case "home":
        return doctor.homeVisitFee ?? doctor.consultationFee ?? 0
      default:
        return doctor.consultationFee ?? 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">الطبيب غير موجود</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  const placeholderImage = doctor?.gender === "female" ? "/female-doctor-hijab.jpg" : "/male-doctor.png"

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">حجز موعد</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Doctor Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                <img
                  src={doctor?.image || placeholderImage}
                  alt={doctor?.nameAr || "طبيب"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold">
                  {doctor?.titleAr || ""} {doctor?.nameAr || "طبيب"}
                </h2>
                <p className="text-sm text-primary">{doctor?.specialtyAr || "تخصص عام"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">نوع الموعد</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={appointmentType === "clinic" ? "default" : "outline"}
                onClick={() => setAppointmentType("clinic")}
                className="flex-col h-auto py-3"
              >
                <MapPin className="h-5 w-5 mb-1" />
                <span className="text-xs">في العيادة</span>
                <span className="text-xs mt-1">{doctor?.consultationFee ?? 0} ج.م</span>
              </Button>

              {doctor?.availableForOnline && (
                <Button
                  variant={appointmentType === "online" ? "default" : "outline"}
                  onClick={() => setAppointmentType("online")}
                  className="flex-col h-auto py-3"
                >
                  <Video className="h-5 w-5 mb-1" />
                  <span className="text-xs">أونلاين</span>
                  <span className="text-xs mt-1">
                    {doctor?.onlineConsultationFee ?? doctor?.consultationFee ?? 0} ج.م
                  </span>
                </Button>
              )}

              {doctor?.availableForHomeVisit && (
                <Button
                  variant={appointmentType === "home" ? "default" : "outline"}
                  onClick={() => setAppointmentType("home")}
                  className="flex-col h-auto py-3"
                >
                  <Home className="h-5 w-5 mb-1" />
                  <span className="text-xs">زيارة منزلية</span>
                  <span className="text-xs mt-1">{doctor?.homeVisitFee ?? doctor?.consultationFee ?? 0} ج.م</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              اختر التاريخ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => {
                    setSelectedDate(date.value)
                    setSelectedSlot(null)
                  }}
                  className={`flex-shrink-0 w-20 p-3 rounded-xl border text-center transition-all ${
                    selectedDate === date.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-xs">{date.dayName}</p>
                  <p className="font-bold mt-1">{date.label.split(" ")[1]}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                اختر الوقت
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {slots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        selectedSlot?.id === slot.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>لا توجد مواعيد متاحة في هذا اليوم</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Patient Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">بيانات المريض</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="patientName">الاسم الكامل *</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="أدخل اسم المريض"
                />
              </div>

              <div>
                <Label htmlFor="patientPhone">رقم الهاتف *</Label>
                <Input
                  id="patientPhone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div>
                <Label htmlFor="patientAge">العمر</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="السن"
                />
              </div>

              <div className="col-span-2">
                <Label>الجنس</Label>
                <RadioGroup
                  value={patientGender}
                  onValueChange={(v) => setPatientGender(v as "male" | "female")}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal cursor-pointer">
                      ذكر
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal cursor-pointer">
                      أنثى
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {appointmentType === "home" && (
                <div className="col-span-2">
                  <Label htmlFor="address">العنوان *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل العنوان بالتفصيل"
                    rows={2}
                  />
                </div>
              )}

              <div className="col-span-2">
                <Label htmlFor="symptoms">الأعراض (اختياري)</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="صف الأعراض أو سبب الزيارة"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "wallet" | "cash")}
              className="space-y-3"
            >
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setPaymentMethod("wallet")}
              >
                <RadioGroupItem value="wallet" id="wallet" />
                <Wallet className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <Label htmlFor="wallet" className="cursor-pointer">
                    المحفظة
                  </Label>
                  <p className="text-xs text-muted-foreground">ادفع من رصيد محفظتك</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <RadioGroupItem value="cash" id="cash" />
                <Banknote className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <Label htmlFor="cash" className="cursor-pointer">
                    كاش
                  </Label>
                  <p className="text-xs text-muted-foreground">ادفع عند الطبيب</p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">المجموع</span>
          <span className="text-2xl font-bold text-primary">{getPrice()} ج.م</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedSlot || !patientName || !patientPhone || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
              جاري الحجز...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 ml-2" />
              تأكيد الحجز
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
