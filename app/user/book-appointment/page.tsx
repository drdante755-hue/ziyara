"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import {
  Building2,
  Stethoscope,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { ClinicSelection } from "@/components/booking/clinic-selection"
import { MedicalCenterSelection } from "@/components/booking/medical-center-selection"
import { ServiceSelection } from "@/components/booking/service-selection"
import { DoctorSelection } from "@/components/booking/doctor-selection"
import { DateTimeSelection } from "@/components/booking/date-time-selection"
import { PaymentMethodSelection } from "@/components/booking/payment-method-selection"
import { BookingReview } from "@/components/booking/booking-review"
import { BookingSuccess } from "@/components/booking/booking-success"

const BOOKING_STEPS = [
  { id: 1, name: "اختيار العيادة", icon: Building2 },
  { id: 2, name: "اختيار الخدمة", icon: Stethoscope },
  { id: 3, name: "اختيار الطبيب", icon: User },
  { id: 4, name: "الموعد والوقت", icon: Calendar },
  { id: 5, name: "طريقة الدفع", icon: CreditCard },
  { id: 6, name: "المراجعة", icon: CheckCircle },
]

export default function BookAppointmentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    medicalCenter: null as any,
    clinic: null as any,
    service: null as any,
    doctor: null as any,
    date: null as string | null,
    timeSlot: null as any,
    paymentMethod: "cash" as "cash" | "wallet",
    walletBalance: 0,
  })
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  // read query params to preselect clinic or medical center when coming from lists
  const searchParams = useSearchParams()

  useEffect(() => {
    const clinicId = searchParams?.get("clinicId")
    const medicalCenterId = searchParams?.get("medicalCenterId")

    if (clinicId) {
      ;(async () => {
        try {
          const res = await fetch(`/api/clinics/${clinicId}`)
          const data = await res.json()
          if (data?.success && data?.clinic) {
            setBookingData((b) => ({ ...b, clinic: data.clinic, medicalCenter: null }))
            // skip clinic selection step
            setCurrentStep(2)
          }
        } catch (e) {
          // ignore
        }
      })()
      return
    }

    if (medicalCenterId) {
      ;(async () => {
        try {
          const res = await fetch(`/api/medical-centers/${medicalCenterId}`)
          const data = await res.json()
          if (data?.success && data?.center) {
            setBookingData((b) => ({ ...b, medicalCenter: data.center }))
            // keep currentStep at 1 so user picks clinic within the center
          }
        } catch (e) {
          // ignore
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/user/book-appointment")
    }
    // fetch user profile (phone / names) to include in booking
    if (status === "authenticated") {
      ;(async () => {
        try {
          const res = await fetch("/api/user/check-profile")
          const data = await res.json()
          if (data.success) setProfile(data.user || data.user)
        } catch (e) {
          // ignore
        }
      })()
    }
  }, [status, router])

  // Calculate progress
  const progress = (currentStep / BOOKING_STEPS.length) * 100

  const handleNext = () => {
    setError(null)
    if (currentStep < BOOKING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmitBooking()
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitBooking = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: bookingData.clinic._id,
          providerId: bookingData.doctor._id,
          slotId: bookingData.timeSlot._id,
          date: bookingData.date,
          startTime: bookingData.timeSlot.startTime,
          endTime: bookingData.timeSlot.endTime,
          type: "clinic",
          price: bookingData.service.price,
          totalPrice: bookingData.service.price,
          paymentMethod: bookingData.paymentMethod,
          patientName:
            profile && (profile.firstName || profile.lastName)
              ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
              : session?.user?.name || undefined,
          patientPhone: profile?.phone || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setBookingResult(result.booking)
        setCurrentStep(BOOKING_STEPS.length + 1) // Move to success screen
      } else {
        setError(result.error || "حدث خطأ أثناء إنشاء الحجز")
      }
    } catch (error) {
      console.error("Booking error:", error)
      setError("فشل في إنشاء الحجز. يرجى المحاولة مرة أخرى")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!bookingData.clinic
      case 2:
        return !!bookingData.service
      case 3:
        return !!bookingData.doctor
      case 4:
        return !!bookingData.date && !!bookingData.timeSlot
      case 5:
        return !!bookingData.paymentMethod
      case 6:
        return true
      default:
        return false
    }
  }

  // Show success screen
  if (currentStep === BOOKING_STEPS.length + 1 && bookingResult) {
    return <BookingSuccess booking={bookingResult} />
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress Stepper */}
        <Card className="mb-6 p-4 sm:p-6">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {BOOKING_STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-primary text-white"
                          : isActive
                            ? "bg-primary text-white ring-4 ring-primary/20"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs sm:text-sm text-center ${
                        isActive ? "text-primary font-semibold" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < BOOKING_STEPS.length - 1 && (
                    <div className={`hidden sm:block w-12 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">حدث خطأ</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <MedicalCenterSelection
                selectedCenter={bookingData.medicalCenter}
                onSelect={(center) =>
                  setBookingData({
                    ...bookingData,
                    medicalCenter: center,
                    clinic: null,
                    service: null,
                    doctor: null,
                    date: null,
                    timeSlot: null,
                  })
                }
              />

              {bookingData.medicalCenter && (
                <ClinicSelection
                  selectedClinic={bookingData.clinic}
                  onSelect={(clinic) =>
                    setBookingData({ ...bookingData, clinic, service: null, doctor: null, date: null, timeSlot: null })
                  }
                  medicalCenterId={bookingData.medicalCenter._id}
                />
              )}
            </div>
          )}
          {currentStep === 2 && (
            <ServiceSelection
              clinicId={bookingData.clinic?._id}
              selectedService={bookingData.service}
              onSelect={(service) => setBookingData({ ...bookingData, service })}
            />
          )}
          {currentStep === 3 && (
            <DoctorSelection
              clinicId={bookingData.clinic?._id}
              serviceId={bookingData.service?._id}
              selectedDoctor={bookingData.doctor}
              onSelect={(doctor) => setBookingData({ ...bookingData, doctor })}
            />
          )}
          {currentStep === 4 && (
            <DateTimeSelection
              doctorId={bookingData.doctor?._id}
              clinicId={bookingData.clinic?._id}
              selectedDate={bookingData.date}
              selectedTimeSlot={bookingData.timeSlot}
              onSelectDate={(date) => setBookingData({ ...bookingData, date, timeSlot: null })}
              onSelectTimeSlot={(timeSlot) => setBookingData({ ...bookingData, timeSlot })}
            />
          )}
          {currentStep === 5 && (
            <PaymentMethodSelection
              amount={bookingData.service?.price || 0}
              paymentMethod={bookingData.paymentMethod}
              walletBalance={bookingData.walletBalance}
              onSelectPaymentMethod={(method) => setBookingData({ ...bookingData, paymentMethod: method })}
            />
          )}
          {currentStep === 6 && <BookingReview bookingData={bookingData} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="flex-1 bg-white">
              <ArrowRight className="w-4 h-4 ml-2" />
              السابق
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canProceed() || isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : currentStep === BOOKING_STEPS.length ? (
              "تأكيد الحجز"
            ) : (
              <>
                التالي
                <ArrowLeft className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
