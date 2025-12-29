"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Shield,
  Stethoscope,
  CalendarCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"

interface Clinic {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  address: string | { street?: string; city?: string; area?: string; governorate?: string }
  city: string
  area: string
  phone: string
  email?: string
  images: string[]
  logo?: string
  specialties: string[]
  workingHours?: Array<{
    day: string
    dayAr: string
    from: string
    to: string
    isOpen: boolean
  }>
  rating: number
  reviewsCount: number
  isFeatured: boolean
  amenities?: string[]
  insuranceAccepted?: string[]
}

interface ClinicDetailsModalProps {
  clinic: Clinic | null
  open: boolean
  onClose: () => void
  onBookAppointment?: (clinicId: string) => void
}

export default function ClinicDetailsModal({ clinic, open, onClose, onBookAppointment }: ClinicDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!clinic) return null

  const images = clinic.images?.length > 0 ? clinic.images : [clinic.logo || "/medical-clinic.png"]

  const addressText =
    typeof clinic.address === "string"
      ? clinic.address
      : [clinic.address?.street, clinic.address?.city, clinic.address?.area].filter(Boolean).join(" - ")

  const cityAreaText =
    typeof clinic.address === "string"
      ? [clinic.city, clinic.area].filter(Boolean).join(" - ")
      : [clinic.address?.city, clinic.address?.area].filter(Boolean).join(" - ")

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleBookAppointment = () => {
    onBookAppointment?.(clinic.id)
    onClose()
  }

  const [providerSchedules, setProviderSchedules] = useState<Clinic["workingHours"]>([])

  useEffect(() => {
    const fetchProviderSchedule = async () => {
      try {
        // only fetch if clinic has no workingHours
        if (clinic.workingHours && clinic.workingHours.length > 0) return
        const res = await fetch(`/api/providers?clinicId=${clinic.id}&limit=1`)
        const data = await res.json()
        const provider = data?.providers?.[0]
        if (!provider || !provider.availability) return

        const availability = provider.availability || {}

        const engToAr: Record<string, string> = {
          sat: "السبت",
          sun: "الأحد",
          mon: "الاثنين",
          tue: "الثلاثاء",
          wed: "الأربعاء",
          thu: "الخميس",
          fri: "الجمعة",
          saturday: "السبت",
          sunday: "الأحد",
          monday: "الاثنين",
          tuesday: "الثلاثاء",
          wednesday: "الأربعاء",
          thursday: "الخميس",
          friday: "الجمعة",
        }

        const weekOrder = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]

        const mapDay = (key: string) => {
          if (!key) return ""
          const low = String(key).toLowerCase()
          if (engToAr[low]) return engToAr[low]
          // direct Arabic day
          if (weekOrder.includes(key)) return key
          // common english abbreviations
          if (low.startsWith("sat")) return "السبت"
          if (low.startsWith("sun")) return "الأحد"
          if (low.startsWith("mon")) return "الاثنين"
          if (low.startsWith("tue")) return "الثلاثاء"
          if (low.startsWith("wed")) return "الأربعاء"
          if (low.startsWith("thu")) return "الخميس"
          if (low.startsWith("fri")) return "الجمعة"
          return key
        }

        let schedules: any[] = []

        // If availability.perDay is an object with keys per day
        if (availability.perDay && typeof availability.perDay === "object") {
          const keys = Object.keys(availability.perDay)
          // create normalized map
          const map: Record<string, any> = {}
          keys.forEach((k) => (map[k] = availability.perDay[k]))

          weekOrder.forEach((day) => {
            const foundKey = keys.find((k) => mapDay(k) === day || k === day)
            if (foundKey) {
              const d = map[foundKey]
              const from = d.startTime || d.start || d.from || d.openTime || availability.defaultStartTime || ""
              const to = d.endTime || d.end || d.to || d.closeTime || availability.defaultEndTime || ""
              const isOpen = d.enabled !== false && (from || to)
              schedules.push({ day, dayAr: day, from, to, isOpen })
            } else {
              const isOpen = Array.isArray(availability.workingDays)
                ? availability.workingDays.map(mapDay).includes(day)
                : false
              schedules.push({ day, dayAr: day, from: availability.defaultStartTime || "", to: availability.defaultEndTime || "", isOpen })
            }
          })
        }

        // If availability.workingHours is an array of entries
        else if (Array.isArray(availability.workingHours) && availability.workingHours.length > 0) {
          // map entries to weekOrder order if possible
          const byDay: Record<string, any> = {}
          availability.workingHours.forEach((wh: any) => {
            const dayName = mapDay(wh.day || wh.dayName || wh.dayAr || wh.name || "")
            byDay[dayName || wh.day || wh.dayName || wh.name] = wh
          })
          weekOrder.forEach((day) => {
            const wh = byDay[day]
            if (wh) {
              const from = wh.from || wh.openTime || wh.startTime || availability.defaultStartTime || ""
              const to = wh.to || wh.closeTime || wh.endTime || availability.defaultEndTime || ""
              const isOpen = wh.isOpen !== false && (from || to)
              schedules.push({ day, dayAr: day, from, to, isOpen })
            } else {
              schedules.push({ day, dayAr: day, from: availability.defaultStartTime || "", to: availability.defaultEndTime || "", isOpen: false })
            }
          })
        }

        // If availability.workingDays (array) with default times
        else if (Array.isArray(availability.workingDays) && availability.workingDays.length > 0) {
          weekOrder.forEach((day) => {
            const isOpen = availability.workingDays.map(mapDay).includes(day)
            schedules.push({ day, dayAr: day, from: availability.defaultStartTime || "", to: availability.defaultEndTime || "", isOpen })
          })
        }

        // Last resort: try provider.schedule or provider.schedules fields
        else if (Array.isArray(provider.schedules) && provider.schedules.length > 0) {
          const byDay: Record<string, any> = {}
          provider.schedules.forEach((s: any) => (byDay[mapDay(s.day) || s.day] = s))
          weekOrder.forEach((day) => {
            const s = byDay[day]
            if (s) schedules.push({ day, dayAr: day, from: s.from || s.startTime || "", to: s.to || s.endTime || "", isOpen: s.enabled !== false })
            else schedules.push({ day, dayAr: day, from: "", to: "", isOpen: false })
          })
        }

        if (schedules.length > 0) setProviderSchedules(schedules)
      } catch (err) {
        console.error("Error fetching provider schedule:", err)
      }
    }

    fetchProviderSchedule()
  }, [clinic])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-white overflow-hidden">
        <DialogTitle className="sr-only">{clinic.nameAr || clinic.name}</DialogTitle>

        <ScrollArea className="max-h-[90vh]">
          {/* صورة العيادة */}
          <div className="relative w-full h-64 md:h-80 bg-gray-100">
            <Image
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={clinic.nameAr || clinic.name}
              fill
              className="object-cover"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                      }`}
                      aria-label={`الصورة ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {clinic.isFeatured && (
              <Badge className="absolute top-4 right-4 bg-amber-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 ml-1" />
                عيادة مميزة
              </Badge>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full transition-colors shadow-lg"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* العنوان والتقييم */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{clinic.nameAr || clinic.name}</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(clinic.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{clinic.rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-gray-500 text-sm">({clinic.reviewsCount || 0} تقييم)</span>
                </div>
              </div>
            </div>

            {/* الوصف */}
            {(clinic.descriptionAr || clinic.description) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  نبذة عن العيادة
                </h3>
                <p className="text-gray-600 leading-relaxed">{clinic.descriptionAr || clinic.description}</p>
              </div>
            )}

            <Separator />

            {/* التخصصات */}
            {clinic.specialties?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">التخصصات الطبية</h3>
                <div className="flex flex-wrap gap-2">
                  {clinic.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 ml-1.5" />
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* معلومات الاتصال والموقع */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات الاتصال</h3>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">العنوان</p>
                    <p className="text-sm leading-relaxed">{addressText}</p>
                    <p className="text-sm text-gray-500 mt-1">{cityAreaText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">رقم الهاتف</p>
                    <a href={`tel:${clinic.phone}`} className="text-emerald-600 hover:underline">
                      {clinic.phone}
                    </a>
                  </div>
                </div>
                {clinic.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">البريد الإلكتروني</p>
                      <a href={`mailto:${clinic.email}`} className="text-emerald-600 hover:underline text-sm">
                        {clinic.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ساعات العمل */}
              {(clinic.workingHours && clinic.workingHours.length > 0) || (providerSchedules && providerSchedules.length > 0) ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    ساعات العمل
                  </h3>
                  <div className="space-y-2">
                    {(clinic.workingHours && clinic.workingHours.length > 0 ? clinic.workingHours : providerSchedules || []).map((schedule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">{schedule.dayAr || schedule.day}</span>
                        {schedule.isOpen ? (
                          <span className="text-emerald-600">
                            {schedule.from} - {schedule.to}
                          </span>
                        ) : (
                          <span className="text-red-500">مغلق</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* المرافق */}
            {clinic.amenities && clinic.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">المرافق والخدمات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {clinic.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            
            {/* التأمينات المقبولة */}
            {clinic.insuranceAccepted && clinic.insuranceAccepted.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    التأمينات المقبولة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {clinic.insuranceAccepted.map((insurance, index) => (
                      <Badge key={index} variant="outline" className="border-emerald-200 text-gray-700 px-3 py-1.5">
                        {insurance}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* زر الحجز */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button
                onClick={handleBookAppointment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <CalendarCheck className="w-5 h-5 ml-2" />
                احجز موعد الآن
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
