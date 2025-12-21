"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin, Star, Search, Filter, ChevronRight, ChevronLeft, Check } from "lucide-react"

// Mock data for specialties
const specialties = [
  { id: 1, name: "الطب الباطني", icon: "🫀", description: "تشخيص وعلاج الأمراض الداخلية", doctorCount: 15 },
  { id: 2, name: "طب العظام", icon: "🦴", description: "علاج إصابات وأمراض العظام", doctorCount: 12 },
  { id: 3, name: "طب الأطفال", icon: "👶", description: "الرعاية الطبية للأطفال", doctorCount: 18 },
  { id: 4, name: "طب النساء والتوليد", icon: "👩‍⚕️", description: "صحة المرأة والحمل", doctorCount: 10 },
  { id: 5, name: "طب القلب", icon: "❤️", description: "تشخيص وعلاج أمراض القلب", doctorCount: 8 },
  { id: 6, name: "طب الأعصاب", icon: "🧠", description: "علاج أمراض الجهاز العصبي", doctorCount: 6 },
  { id: 7, name: "طب العيون", icon: "👁️", description: "فحص وعلاج أمراض العيون", doctorCount: 9 },
  { id: 8, name: "طب الأسنان", icon: "🦷", description: "علاج وتجميل الأسنان", doctorCount: 14 },
]

// Mock data for doctors
const doctors = [
  {
    id: 1,
    name: "د. أحمد محمد علي",
    specialty: "الطب الباطني",
    experience: 15,
    rating: 4.8,
    reviewCount: 124,
    price: 200,
    image: "/placeholder-gjy4b.png",
    location: "مستشفى الملك فيصل",
    availableDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء"],
    nextAvailable: "2024-01-15",
  },
  {
    id: 2,
    name: "د. فاطمة السعيد",
    specialty: "طب الأطفال",
    experience: 12,
    rating: 4.9,
    reviewCount: 89,
    price: 180,
    image: "/female-doctor-professional.png",
    location: "مستشفى الملك عبدالعزيز",
    availableDays: ["الأحد", "الثلاثاء", "الخميس"],
    nextAvailable: "2024-01-16",
  },
  {
    id: 3,
    name: "د. محمد الأحمد",
    specialty: "طب العظام",
    experience: 20,
    rating: 4.7,
    reviewCount: 156,
    price: 250,
    image: "/placeholder-kfwnl.png",
    location: "مستشفى الملك خالد",
    availableDays: ["الاثنين", "الأربعاء", "الخميس", "السبت"],
    nextAvailable: "2024-01-17",
  },
]

// Mock data for time slots
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

export default function AppointmentsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientAge: "",
    patientPhone: "",
    patientEmail: "",
    notes: "",
    paymentMethod: "cash",
  })
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")
  const router = useRouter()

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const days = []

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i)
      const dateString = date.toISOString().split("T")[0]
      const isAvailable = i >= today.getDate() && i <= today.getDate() + 30
      days.push({
        day: i,
        date: dateString,
        isAvailable,
        isToday: i === today.getDate(),
      })
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  const handleSpecialtySelect = (specialtyId: number) => {
    setSelectedSpecialty(specialtyId)
    setCurrentStep(2)
  }

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor)
    setCurrentStep(3)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleBookingSubmit = () => {
    // Generate booking number
    const bookingNum = "APT" + Math.random().toString(36).substr(2, 9).toUpperCase()
    setBookingNumber(bookingNum)
    setBookingConfirmed(true)
    setCurrentStep(5)
  }

  const filteredDoctors = doctors
    .filter(
      (doctor) => !selectedSpecialty || doctor.specialty === specialties.find((s) => s.id === selectedSpecialty)?.name,
    )
    .filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > step ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && <div className={`w-12 h-0.5 mx-2 ${currentStep > step ? "bg-primary" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  )

  const renderSpecialtySelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">اختر التخصص الطبي</h2>
        <p className="text-muted-foreground">اختر التخصص المناسب لحالتك الصحية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialties.map((specialty) => (
          <div key={specialty.id} className="specialty-card" onClick={() => handleSpecialtySelect(specialty.id)}>
            <div className="text-center">
              <div className="text-4xl mb-3">{specialty.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{specialty.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{specialty.description}</p>
              <Badge variant="secondary" className="text-xs">
                {specialty.doctorCount} طبيب متاح
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDoctorSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">اختر الطبيب</h2>
          <p className="text-muted-foreground">
            {selectedSpecialty && `أطباء ${specialties.find((s) => s.id === selectedSpecialty)?.name}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          تغيير التخصص
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="البحث عن طبيب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card" onClick={() => handleDoctorSelect(doctor)}>
            <div className="flex gap-4">
              <img
                src={doctor.image || "/placeholder.svg"}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{doctor.specialty}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{doctor.experience} سنة خبرة</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="text-lg font-semibold text-primary">{doctor.price} ريال</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">اختر الموعد</h2>
          <p className="text-muted-foreground">{selectedDoctor && `موعد مع ${selectedDoctor.name}`}</p>
        </div>
        <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          تغيير الطبيب
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              اختر التاريخ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => (
                <div
                  key={day.day}
                  className={`calendar-day ${
                    day.isAvailable ? "calendar-day-available" : "opacity-50 cursor-not-allowed"
                  } ${selectedDate === day.date ? "calendar-day-selected" : ""}`}
                  onClick={() => day.isAvailable && handleDateSelect(day.date)}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              اختر الوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`time-slot ${selectedTime === time ? "time-slot-selected" : ""}`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">اختر التاريخ أولاً لعرض الأوقات المتاحة</div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <div className="flex justify-center">
          <Button onClick={() => setCurrentStep(4)} className="px-8">
            متابعة إلى تأكيد الحجز
            <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
      )}
    </div>
  )

  const renderBookingConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">تأكيد الحجز</h2>
        <p className="text-muted-foreground">أكمل بياناتك لتأكيد الموعد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الموعد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDoctor && (
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.image || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{selectedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{selectedDoctor?.location}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">سعر الكشف:</span>
                <span className="text-lg font-bold text-primary">{selectedDoctor?.price} ريال</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات المريض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientName">الاسم الكامل *</Label>
              <Input
                id="patientName"
                value={bookingData.patientName}
                onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div>
              <Label htmlFor="patientAge">العمر *</Label>
              <Input
                id="patientAge"
                type="number"
                value={bookingData.patientAge}
                onChange={(e) => setBookingData({ ...bookingData, patientAge: e.target.value })}
                placeholder="أدخل العمر"
              />
            </div>
            <div>
              <Label htmlFor="patientPhone">رقم الهاتف *</Label>
              <Input
                id="patientPhone"
                value={bookingData.patientPhone}
                onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                placeholder="05xxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="patientEmail">البريد الإلكتروني</Label>
              <Input
                id="patientEmail"
                type="email"
                value={bookingData.patientEmail}
                onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                placeholder="أي ملاحظات أو أعراض تود ذكرها..."
                rows={3}
              />
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={bookingData.paymentMethod === "cash"}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                  />
                  <span>الدفع عند الحضور</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={bookingData.paymentMethod === "online"}
                    onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                  />
                  <span>الدفع الإلكتروني</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          <ChevronRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        <Button
          onClick={handleBookingSubmit}
          disabled={!bookingData.patientName || !bookingData.patientAge || !bookingData.patientPhone}
          className="px-8"
        >
          تأكيد الحجز
        </Button>
      </div>
    </div>
  )

  const renderBookingSuccess = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">تم تأكيد الحجز بنجاح!</h2>
        <p className="text-muted-foreground">تم إرسال تفاصيل الموعد إلى هاتفك وبريدك الإلكتروني</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">رقم الحجز</h3>
              <div className="text-2xl font-bold text-primary bg-primary/10 py-2 px-4 rounded-lg">{bookingNumber}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الطبيب:</span>
                <span className="font-medium">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>الوقت:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>المريض:</span>
                <span className="font-medium">{bookingData.patientName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            setCurrentStep(1)
            setSelectedSpecialty(null)
            setSelectedDoctor(null)
            setSelectedDate("")
            setSelectedTime("")
            setBookingData({
              patientName: "",
              patientAge: "",
              patientPhone: "",
              patientEmail: "",
              notes: "",
              paymentMethod: "cash",
            })
            setBookingConfirmed(false)
            setBookingNumber("")
          }}
          variant="outline"
        >
          حجز موعد جديد
        </Button>
        <Button onClick={() => router.push('/')}>الصفحة الرئيسية</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {!bookingConfirmed && renderStepIndicator()}

        {currentStep === 1 && renderSpecialtySelection()}
        {currentStep === 2 && renderDoctorSelection()}
        {currentStep === 3 && renderDateTimeSelection()}
        {currentStep === 4 && renderBookingConfirmation()}
        {currentStep === 5 && renderBookingSuccess()}
      </div>
    </div>
  )
}
