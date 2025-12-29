"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Loader2,
  RefreshCw,
  UserRound,
  Star,
  Briefcase,
  Phone,
  Clock,
  Calendar,
  Check,
  Building2,
  Hospital,
} from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available

interface Provider {
  [x: string]: any
  _id: string
  name: string
  nameEn?: string
  title: string
  bio?: string
  profileImage?: string
  specialty: string
  subSpecialties: string[]
  qualifications: string[]
  experience: number
  consultationFee: number
  followUpFee?: number
  homeVisitFee?: number
  phone?: string
  email?: string
  clinic?: { _id: string; name: string }
  medicalCenter?: { _id: string; name: string }
  rating: number
  reviewsCount: number
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  offersHomeVisit: boolean
  offersOnlineConsultation: boolean
  // optional availability fields
  availability?: {
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    days?: string[]
    // new availability fields
    defaultScheduleEnabled?: boolean
    defaultStartTime?: string
    defaultEndTime?: string
    slotDuration?: number
    customDays?: Record<string, { startTime?: string; endTime?: string; enabled?: boolean; isClosed?: boolean }>
    // redesigned availability fields
    workingDays?: string[]
  }
}

interface ProviderFormData {
  name: string
  nameEn: string
  title: string
  bio: string
  profileImage: string
  specialty: string
  customSpecialty: string
  subSpecialties: string
  experience: string
  consultationFee: string
  followUpFee: string
  homeVisitFee: string
  phone: string
  email: string
  clinicId: string
  medicalCenterId: string
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  offersHomeVisit: boolean
  offersOnlineConsultation: boolean
  // availability
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  days: string[]
  perDayAvailability: Record<string, { startTime?: string; endTime?: string; enabled?: boolean }>
  // new availability fields
  defaultScheduleEnabled?: boolean
  defaultStartTime?: string
  defaultEndTime?: string
  slotDuration?: number
  clinicCustomDays: Record<string, { startTime?: string; endTime?: string; enabled?: boolean; isClosed?: boolean }>
  medicalCenterCustomDays: Record<
    string,
    { startTime?: string; endTime?: string; enabled?: boolean; isClosed?: boolean }
  >
  clinicStartTime: string
  clinicEndTime: string
  medicalCenterStartTime: string
  medicalCenterEndTime: string
  // redesigned availability fields
  workingDays?: string[]
}

const MEDICAL_SPECIALTIES = [
  "طب عام",
  "طب الأسرة",
  "طب الأطفال",
  "طب النساء والتوليد",
  "طب الباطنة",
  "جراحة عامة",
  "جراحة العظام",
  "جراحة المسالك البولية",
  "جراحة الأوعية الدموية",
  "جراحة المخ والأعصاب",
  "جراحة القلب والصدر",
  "جراحة التجميل",
  "طب العيون",
  "طب الأنف والأذن والحنجرة",
  "طب الأسنان",
  "تقويم الأسنان",
  "جراحة الفم والوجه والفكين",
  "طب الجلدية",
  "طب القلب",
  "طب الصدر والجهاز التنفسي",
  "طب الأعصاب",
  "الطب النفسي",
  "طب الروماتيزم",
  "طب الغدد الصماء والسكري",
  "طب الكلى",
  "طب الجهاز الهضمي والكبد",
  "طب الأورام",
  "طب أمراض الدم",
  "طب المناعة والحساسية",
  "طب الطوارئ",
  "طب العناية المركزة",
  "طب التخدير",
  "الأشعة التشخيصية",
  "الطب النووي",
  "العلاج الطبيعي",
  "التغذية العلاجية",
  "الصحة النفسية",
  "طب الذكورة",
  "طب المسنين",
]

const WEEK_DAYS = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]

const AvailabilityModal = ({
  formData,
  setFormData,
  onClose,
  type, // 'clinic' or 'medicalCenter'
}: {
  formData: any
  setFormData: (fn: (prev: any) => any) => void
  onClose: () => void
  type: "clinic" | "medicalCenter"
}) => {
  const weekDays = [
    { key: "sunday", label: "الأحد", nameEn: "Sunday" },
    { key: "monday", label: "الاثنين", nameEn: "Monday" },
    { key: "tuesday", label: "الثلاثاء", nameEn: "Tuesday" },
    { key: "wednesday", label: "الأربعاء", nameEn: "Wednesday" },
    { key: "thursday", label: "الخميس", nameEn: "Thursday" },
    { key: "friday", label: "الجمعة", nameEn: "Friday" },
    { key: "saturday", label: "السبت", nameEn: "Saturday" },
  ]

  const customDaysKey = type === "clinic" ? "clinicCustomDays" : "medicalCenterCustomDays"
  const startTimeKey = type === "clinic" ? "clinicStartTime" : "medicalCenterStartTime"
  const endTimeKey = type === "clinic" ? "clinicEndTime" : "medicalCenterEndTime"
  const title = type === "clinic" ? "إعدادات أوقات العمل - العيادة" : "إعدادات أوقات العمل - المركز الطبي"

  const toggleDay = (dayKey: string) => {
    setFormData((prev: any) => {
      const customDays = { ...(prev[customDaysKey] || {}) }

      if (customDays[dayKey]?.enabled) {
        // Disable the day
        customDays[dayKey] = { ...customDays[dayKey], enabled: false, isClosed: true }
      } else {
        // Enable the day with default times
        customDays[dayKey] = {
          enabled: true,
          startTime: prev[startTimeKey] || "09:00",
          endTime: prev[endTimeKey] || "17:00",
          isClosed: false,
        }
      }

      return { ...prev, [customDaysKey]: customDays }
    })
  }

  const updateCustomDayTime = (dayKey: string, field: "startTime" | "endTime", value: string) => {
    setFormData((prev: any) => {
      const customDays = { ...(prev[customDaysKey] || {}) }
      customDays[dayKey] = { ...customDays[dayKey], [field]: value }
      return { ...prev, [customDaysKey]: customDays }
    })
  }

  const toggleDayClosed = (dayKey: string) => {
    setFormData((prev: any) => {
      const customDays = { ...(prev[customDaysKey] || {}) }
      customDays[dayKey] = {
        ...customDays[dayKey],
        isClosed: !customDays[dayKey]?.isClosed,
      }
      return { ...prev, [customDaysKey]: customDays }
    })
  }

  const isDayEnabled = (dayKey: string) => {
    return formData[customDaysKey]?.[dayKey]?.enabled || false
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">حدد الأيام وأوقات العمل لكل يوم</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Default Working Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">أوقات العمل الافتراضية</h3>
            </div>

            <p className="text-sm text-muted-foreground">حدد الوقت الافتراضي الذي سيتم تطبيقه على جميع الأيام</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  وقت البدء
                </label>
                <Input
                  type="time"
                  value={formData[startTimeKey] || "09:00"}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [startTimeKey]: e.target.value,
                    }))
                  }
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  وقت الانتهاء
                </label>
                <Input
                  type="time"
                  value={formData[endTimeKey] || "17:00"}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [endTimeKey]: e.target.value,
                    }))
                  }
                  className="text-lg"
                />
              </div>
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">أيام وأوقات العمل</h3>
            </div>

            <p className="text-sm text-muted-foreground">حدد الأيام التي تريد العمل فيها وأوقات كل يوم</p>

            <div className="space-y-3">
              {weekDays.map((day) => {
                const enabled = isDayEnabled(day.key)
                const isClosed = formData[customDaysKey]?.[day.key]?.isClosed || false

                return (
                  <div
                    key={day.key}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      enabled && !isClosed
                        ? "bg-primary/5 border-primary"
                        : isClosed
                          ? "bg-muted/30 border-muted"
                          : "bg-card border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDay(day.key)}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            enabled
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary",
                          )}
                        >
                          {enabled && <Check className="h-3 w-3" />}
                        </button>
                        <span className={cn("font-medium", !enabled && "text-muted-foreground")}>{day.label}</span>
                      </div>

                      {enabled && (
                        <Button
                          type="button"
                          variant={isClosed ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDayClosed(day.key)}
                          className="gap-2"
                        >
                          {isClosed ? (
                            <>
                              <Check className="h-4 w-4" />
                              يوم عطلة
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              جعله عطلة
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {enabled && !isClosed && (
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">من</label>
                          <Input
                            type="time"
                            value={formData[customDaysKey]?.[day.key]?.startTime || formData[startTimeKey] || "09:00"}
                            onChange={(e) => updateCustomDayTime(day.key, "startTime", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">إلى</label>
                          <Input
                            type="time"
                            value={formData[customDaysKey]?.[day.key]?.endTime || formData[endTimeKey] || "17:00"}
                            onChange={(e) => updateCustomDayTime(day.key, "endTime", e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/20">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={onClose} className="gap-2">
              <Check className="h-4 w-4" />
              حفظ الأوقات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProviderModalForm({
  isEdit,
  formData,
  setFormData,
  titles,
  clinics,
  medicalCenters,
  saving,
  onSave,
  onClose,
}: {
  isEdit: boolean
  formData: ProviderFormData
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>
  titles: string[]
  clinics: Array<{ _id: string; name: string }>
  medicalCenters: Array<{ _id: string; name: string }>
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  const allSpecialties = [...MEDICAL_SPECIALTIES]
  if (formData.customSpecialty.trim() && !allSpecialties.includes(formData.customSpecialty.trim())) {
    // لا نضيفها هنا، سنتعامل معها بشكل منفصل
  }

  const handleSelectSpecialty = (specialty: string) => {
    setFormData((prev) => ({ ...prev, specialty, customSpecialty: "" }))
  }

  const handleCustomSpecialtySubmit = () => {
    const trimmed = formData.customSpecialty.trim()
    if (trimmed) {
      setFormData((prev) => ({ ...prev, specialty: trimmed }))
    }
  }

  // Availability helpers
  const makeEmptyPerDay = () => {
    const obj: Record<string, { startTime?: string; endTime?: string; enabled?: boolean }> = {}
    WEEK_DAYS.forEach((d) => (obj[d] = { startTime: "", endTime: "", enabled: false }))
    return obj
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const perDay = { ...(prev.perDayAvailability || {}) }
      const current = perDay[day] || { startTime: "", endTime: "", enabled: false }
      current.enabled = !current.enabled
      perDay[day] = current
      const days = current.enabled
        ? [...new Set([...(prev.days || []), day])]
        : (prev.days || []).filter((d) => d !== day)
      return { ...prev, perDayAvailability: perDay, days }
    })
  }

  const setPerDayTime = (day: string, field: "startTime" | "endTime", value: string) => {
    setFormData((prev) => {
      const perDay = { ...(prev.perDayAvailability || {}) }
      const current = perDay[day] || { startTime: "", endTime: "", enabled: false }
      current[field] = value
      perDay[day] = current
      return { ...prev, perDayAvailability: perDay }
    })
  }

  // Removed per-day UI; helper functions above are no longer used. Keeping definitions
  // removed to clean up the module.

  const [isClinicAvailabilityModalOpen, setIsClinicAvailabilityModalOpen] = useState(false)
  const [isMedicalCenterAvailabilityModalOpen, setIsMedicalCenterAvailabilityModalOpen] = useState(false)

  const [prevClinicId, setPrevClinicId] = useState(formData.clinicId)
  const [prevMedicalCenterId, setPrevMedicalCenterId] = useState(formData.medicalCenterId)

  useEffect(() => {
    if (isEdit) {
      // Check if clinicId changed
      if (formData.clinicId && formData.clinicId !== prevClinicId) {
        setPrevClinicId(formData.clinicId)
        setIsClinicAvailabilityModalOpen(true)
      }
      if (formData.medicalCenterId && formData.medicalCenterId !== prevMedicalCenterId) {
        setPrevMedicalCenterId(formData.medicalCenterId)
        setIsMedicalCenterAvailabilityModalOpen(true)
      }
    }
  }, [formData.clinicId, formData.medicalCenterId, isEdit, prevClinicId, prevMedicalCenterId])

  const handleClinicMedicalCenterChange = (type: "clinic" | "medicalCenter", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === "clinic" ? "clinicId" : "medicalCenterId"]: value,
    }))

    if (value) {
      if (type === "clinic") {
        setIsClinicAvailabilityModalOpen(true)
      } else {
        setIsMedicalCenterAvailabilityModalOpen(true)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{isEdit ? "تعديل الطبيب" : "إضافة طبيب جديد"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الطبيب (عربي) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: د. أحمد محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم الطبيب (إنجليزي)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Example: Dr. Ahmed Mohamed"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اللقب *</label>
              <select
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {titles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">التخصص *</label>
              <select
                value={MEDICAL_SPECIALTIES.includes(formData.specialty) ? formData.specialty : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setFormData((prev) => ({ ...prev, specialty: "" }))
                  } else {
                    handleSelectSpecialty(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">اختر التخصص</option>
                {MEDICAL_SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
                <option value="__custom__">أخرى (تخصص مخصص)</option>
              </select>
            </div>
          </div>

          {(!MEDICAL_SPECIALTIES.includes(formData.specialty) || formData.specialty === "") && (
            <div>
              <label className="block text-sm font-medium mb-1">التخصص المخصص</label>
              <div className="flex gap-2">
                <Input
                  value={formData.customSpecialty || formData.specialty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customSpecialty: e.target.value,
                      specialty: e.target.value,
                    }))
                  }
                  placeholder="أدخل اسم التخصص..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleCustomSpecialtySubmit()
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">أدخل اسم التخصص إذا لم يكن موجودًا في القائمة</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">نبذة عن الطبيب</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="نبذة مختصرة عن الطبيب..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">سنوات الخبرة</label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                placeholder="مثال: 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رابط الصورة الشخصية</label>
              <Input
                value={formData.profileImage}
                onChange={(e) => setFormData((prev) => ({ ...prev, profileImage: e.target.value }))}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          </div>

          {/* Availability Section (Old Component) */}
          <div>
            <label className="block text-sm font-medium mb-2">مواعيد التوفر</label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1">تاريخ البدء</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">تاريخ الانتهاء</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">وقت البدء</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">وقت الانتهاء</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* 'أيام الأسبوع' per-day rows removed as requested */}
          </div>

          {/* Removed old AvailabilitySection component */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">سعر الكشف *</label>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultationFee: e.target.value }))}
                placeholder="مثال: 300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر المتابعة</label>
              <Input
                type="number"
                value={formData.followUpFee}
                onChange={(e) => setFormData((prev) => ({ ...prev, followUpFee: e.target.value }))}
                placeholder="مثال: 150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر الزيارة المنزلية</label>
              <Input
                type="number"
                value={formData.homeVisitFee}
                onChange={(e) => setFormData((prev) => ({ ...prev, homeVisitFee: e.target.value }))}
                placeholder="مثال: 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="doctor@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">العيادة</label>
              <select
                value={formData.clinicId}
                onChange={(e) => handleClinicMedicalCenterChange("clinic", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">بدون عيادة</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id || (clinic as any).id} value={clinic._id || (clinic as any).id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-2">المركز الطبي</label>
              <select
                value={formData.medicalCenterId}
                onChange={(e) => handleClinicMedicalCenterChange("medicalCenter", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">بدون مركز طبي</option>
                {medicalCenters.map((center) => (
                  <option key={center._id || (center as any).id} value={center._id || (center as any).id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(formData.clinicId || formData.medicalCenterId) && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">تحديد أوقات العمل</p>
                    <p className="text-xs text-muted-foreground mt-0.5">قم بتحديد الأيام والأوقات المتاحة للحجز</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {formData.clinicId && (
                    <Button
                      type="button"
                      onClick={() => setIsClinicAvailabilityModalOpen(true)}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      أوقات العيادة
                    </Button>
                  )}
                  {formData.medicalCenterId && (
                    <Button
                      type="button"
                      onClick={() => setIsMedicalCenterAvailabilityModalOpen(true)}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      أوقات المركز
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              نشط
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded"
              />
              مميز
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))}
                className="rounded"
              />
              موثق
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.offersHomeVisit}
                onChange={(e) => setFormData((prev) => ({ ...prev, offersHomeVisit: e.target.checked }))}
                className="rounded"
              />
              زيارة منزلية
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.offersOnlineConsultation}
                onChange={(e) => setFormData((prev) => ({ ...prev, offersOnlineConsultation: e.target.checked }))}
                className="rounded"
              />
              استشارة أونلاين
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {isEdit ? "حفظ التعديلات" : "إضافة"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>

      {isClinicAvailabilityModalOpen && (
        <AvailabilityModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsClinicAvailabilityModalOpen(false)}
          type="clinic"
        />
      )}

      {isMedicalCenterAvailabilityModalOpen && (
        <AvailabilityModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsMedicalCenterAvailabilityModalOpen(false)}
          type="medicalCenter"
        />
      )}
    </div>
  )
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [clinics, setClinics] = useState<Array<{ _id: string; name: string }>>([])
  const [medicalCenters, setMedicalCenters] = useState<Array<{ _id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  const [formData, setFormData] = useState<ProviderFormData>({
    name: "",
    nameEn: "",
    title: "أخصائي",
    bio: "",
    profileImage: "",
    specialty: "",
    customSpecialty: "",
    subSpecialties: "",

    experience: "",
    consultationFee: "",
    followUpFee: "",
    homeVisitFee: "",
    phone: "",
    email: "",
    clinicId: "",
    medicalCenterId: "",
    isActive: true,
    isFeatured: false,
    isVerified: false,
    offersHomeVisit: false,
    offersOnlineConsultation: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    days: [],
    perDayAvailability: WEEK_DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: { startTime: "", endTime: "", enabled: false } }),
      {},
    ),
    // Initialize new availability fields
    defaultScheduleEnabled: true,
    defaultStartTime: "09:00",
    defaultEndTime: "17:00",
    slotDuration: 30,
    clinicCustomDays: {},
    medicalCenterCustomDays: {},
    clinicStartTime: "09:00",
    clinicEndTime: "17:00",
    medicalCenterStartTime: "09:00",
    medicalCenterEndTime: "17:00",
    // Initialize redesigned availability fields
    workingDays: [],
  })

  const titles = ["طبيب عام", "أخصائي", "استشاري", "أستاذ دكتور", "مدرس", "معيد"]

  const fetchProviders = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/providers?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Normalize id field to _id so UI can rely on _id
        const providersData = (result.providers || result.data || []).map((p: any) => ({
          ...p,
          _id: p._id || p.id,
          // ensure we expose image under profileImage used by the UI
          profileImage: p.image || p.profileImage || `/placeholder.svg?height=200&width=200&query=doctor ${p.gender}`,
          // preserve isActive when provided; default true for safety
          isActive: typeof p.isActive === "boolean" ? p.isActive : true,
          qualifications: p.qualifications || [],
        }))
        setProviders(providersData)
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب الأطباء", "error")
        setProviders([])
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
      setProviders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClinics = async () => {
    try {
      const response = await fetch("/api/clinics?active=true")
      const result = await response.json()
      if (result.success) {
        const clinicsData = (result.clinics || result.data || []).map((c: any) => ({ ...c, _id: c._id || c.id }))
        setClinics(clinicsData)
      } else {
        setClinics([])
      }
    } catch (error) {
      console.error("Error fetching clinics:", error)
      setClinics([])
    }
  }

  const fetchMedicalCenters = async () => {
    try {
      const response = await fetch("/api/medical-centers?active=true")
      const result = await response.json()
      if (result.success) {
        const centersData = (result.centers || result.data || []).map((c: any) => ({
          _id: c._id || c.id,
          name: c.nameAr || c.name,
        }))
        setMedicalCenters(centersData)
      } else {
        setMedicalCenters([])
      }
    } catch (error) {
      console.error("Error fetching medical centers:", error)
      setMedicalCenters([])
    }
  }

  useEffect(() => {
    fetchProviders()
    fetchClinics()
    fetchMedicalCenters()
  }, [fetchProviders])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleAddProvider = () => {
    setFormData({
      name: "",
      nameEn: "",
      title: "أخصائي",
      bio: "",
      profileImage: "",
      specialty: "",
      customSpecialty: "",
      subSpecialties: "",
      experience: "",
      consultationFee: "",
      followUpFee: "",
      homeVisitFee: "",
      phone: "",
      email: "",
      clinicId: "",
      medicalCenterId: "",
      isActive: true,
      isFeatured: false,
      isVerified: false,
      offersHomeVisit: false,
      offersOnlineConsultation: false,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      days: [],
      perDayAvailability: WEEK_DAYS.reduce(
        (acc, d) => ({ ...acc, [d]: { startTime: "", endTime: "", enabled: false } }),
        {},
      ),
      // Initialize new availability fields
      defaultScheduleEnabled: true,
      defaultStartTime: "09:00",
      defaultEndTime: "17:00",
      slotDuration: 30,
      clinicCustomDays: {},
      medicalCenterCustomDays: {},
      clinicStartTime: "09:00",
      clinicEndTime: "17:00",
      medicalCenterStartTime: "09:00",
      medicalCenterEndTime: "17:00",
      // Initialize redesigned availability fields
      workingDays: [],
    })
    setShowAddModal(true)
  }

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider)
    const specialtyValue =
      typeof provider.specialty === "string" ? provider.specialty : (provider.specialty as any)?.name || ""
    const availability = (provider as any).availability || {}

    setFormData({
      name: provider.name || "",
      nameEn: provider.nameEn || "",
      title: provider.title || "أخصائي",
      bio: provider.bio || "",
      profileImage: provider.profileImage || "",
      specialty: specialtyValue,
      customSpecialty: MEDICAL_SPECIALTIES.includes(specialtyValue) ? "" : specialtyValue,
      subSpecialties: provider.subSpecialties?.join(", ") || "",

      experience: provider.experience?.toString() || "",
      consultationFee: provider.consultationFee?.toString() || "",
      followUpFee: provider.followUpFee?.toString() || "",
      homeVisitFee: provider.homeVisitFee?.toString() || "",
      phone: provider.phone || "",
      email: provider.email || "",
      clinicId: provider.clinic?._id || (typeof provider.clinic === "string" ? provider.clinic : "") || "",
      medicalCenterId:
        provider.medicalCenter?._id || (typeof provider.medicalCenter === "string" ? provider.medicalCenter : "") || "",
      isActive: provider.isActive ?? true,
      isFeatured: provider.isFeatured ?? false,
      isVerified: provider.isVerified ?? false,
      offersHomeVisit: provider.offersHomeVisit ?? false,
      offersOnlineConsultation: provider.offersOnlineConsultation ?? false,
      // availability
      startDate: availability.startDate || "",
      endDate: availability.endDate || "",
      startTime: availability.startTime || "",
      endTime: availability.endTime || "",
      days: availability.days || [],
      perDayAvailability:
        availability.perDay ||
        WEEK_DAYS.reduce((acc, d) => ({ ...acc, [d]: { startTime: "", endTime: "", enabled: false } }), {}),
      // Populate new availability fields
      defaultScheduleEnabled: availability.defaultScheduleEnabled ?? true,
      defaultStartTime: availability.defaultStartTime || "09:00",
      defaultEndTime: availability.defaultEndTime || "17:00",
      slotDuration: availability.slotDuration || 30,
      // Populate separate availability fields
      clinicCustomDays: availability.clinicCustomDays || {},
      medicalCenterCustomDays: availability.medicalCenterCustomDays || {},
      clinicStartTime: availability.clinicStartTime || "09:00",
      clinicEndTime: availability.clinicEndTime || "17:00",
      medicalCenterStartTime: availability.medicalCenterStartTime || "09:00",
      medicalCenterEndTime: availability.medicalCenterEndTime || "17:00",
      // Initialize redesigned availability fields
      workingDays: availability.workingDays || provider.days || [],
    })
    setShowEditModal(true)
  }

  const handleSaveProvider = async () => {
    // validate before sending
    if (!validateFormData()) return

    try {
      setSaving(true)
      const payload = {
        name: formData.name, // الاسم العربي
        nameAr: formData.name, // الاسم العربي
        nameEn: formData.nameEn || formData.name, // الاسم الإنجليزي (أو العربي إذا لم يُدخل)
        title: formData.title,
        titleAr: formData.title,
        bio: formData.bio,
        image: formData.profileImage,
        // send both specialty/specialtyAr (API expects both)
        specialty: formData.specialty,
        specialtyAr: formData.specialty,
        subSpecialties: formData.subSpecialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: formData.experience ? Number.parseInt(formData.experience) : 0,
        consultationFee: Number.parseInt(formData.consultationFee),
        followUpFee: formData.followUpFee ? Number.parseInt(formData.followUpFee) : undefined,
        homeVisitFee: formData.homeVisitFee ? Number.parseInt(formData.homeVisitFee) : undefined,
        phone: formData.phone,
        email: formData.email,
        clinicId: formData.clinicId || undefined,
        medicalCenterId: formData.medicalCenterId || undefined,
        // API requires gender - set default if not provided
        gender: (formData as any).gender || "male",
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
        availableForHomeVisit: formData.offersHomeVisit,
        availableForOnline: formData.offersOnlineConsultation,
        // availability
        availability: {
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          days: formData.days && formData.days.length ? formData.days : undefined,
          perDay:
            formData.perDayAvailability && Object.keys(formData.perDayAvailability).length
              ? formData.perDayAvailability
              : undefined,
          // send new availability fields
          defaultScheduleEnabled: formData.defaultScheduleEnabled,
          defaultStartTime: formData.defaultStartTime,
          defaultEndTime: formData.defaultEndTime,
          slotDuration: formData.slotDuration,
          // send separate availability fields
          clinicCustomDays: formData.clinicCustomDays,
          medicalCenterCustomDays: formData.medicalCenterCustomDays,
          clinicStartTime: formData.clinicStartTime,
          clinicEndTime: formData.clinicEndTime,
          medicalCenterStartTime: formData.medicalCenterStartTime,
          medicalCenterEndTime: formData.medicalCenterEndTime,
          // Initialize redesigned availability fields
          workingDays: formData.workingDays,
        },
      }

      console.log("[v0] Saving provider with payload:", {
        clinicId: payload.clinicId,
        medicalCenterId: payload.medicalCenterId,
        availability: payload.availability,
      })

      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      console.log("[v0] Save provider response:", result)

      if (result.success) {
        showAlert("تم إضافة الطبيب بنجاح", "success")
        setShowAddModal(false)
        fetchProviders()
      } else {
        showAlert(result.error || "حدث خطأ أثناء إضافة الطبيب", "error")
      }
    } catch (error) {
      console.error("[v0] Error saving provider:", error)
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProvider) {
      showAlert("حدث خطأ أثناء تحديث الطبيب", "error")
      return
    }

    // validate before sending
    if (!validateFormData()) return

    try {
      setSaving(true)
      const payload = {
        name: formData.name, // الاسم العربي
        nameAr: formData.name, // الاسم العربي
        nameEn: formData.nameEn || formData.name, // الاسم الإنجليزي (أو العربي إذا لم يُدخل)
        title: formData.title,
        titleAr: formData.title,
        bio: formData.bio,
        image: formData.profileImage,
        // send both specialty/specialtyAr (API expects both)
        specialty: formData.specialty,
        specialtyAr: formData.specialty,
        subSpecialties: formData.subSpecialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: formData.experience ? Number.parseInt(formData.experience) : 0,
        consultationFee: formData.consultationFee ? Number.parseInt(formData.consultationFee) : 0,
        followUpFee: formData.followUpFee ? Number.parseInt(formData.followUpFee) : undefined,
        homeVisitFee: formData.homeVisitFee ? Number.parseInt(formData.homeVisitFee) : undefined,
        phone: formData.phone,
        email: formData.email,
        clinicId: formData.clinicId || undefined,
        medicalCenterId: formData.medicalCenterId || undefined,
        // API requires gender - set default if not provided
        gender: (formData as any).gender || "male",
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
        availableForHomeVisit: formData.offersHomeVisit,
        availableForOnline: formData.offersOnlineConsultation,
        // availability
        availability: {
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          days: formData.days && formData.days.length ? formData.days : undefined,
          // send separate availability fields
          clinicCustomDays: formData.clinicCustomDays,
          medicalCenterCustomDays: formData.medicalCenterCustomDays,
          clinicStartTime: formData.clinicStartTime,
          clinicEndTime: formData.clinicEndTime,
          medicalCenterStartTime: formData.medicalCenterStartTime,
          medicalCenterEndTime: formData.medicalCenterEndTime,
          // Initialize redesigned availability fields
          workingDays: formData.workingDays,
        },
      }

      const response = await fetch(`/api/providers/${editingProvider._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم تحديث الطبيب بنجاح", "success")
        setShowEditModal(false)
        setEditingProvider(null)
        fetchProviders()
      } else {
        showAlert(result.error || "حدث خطأ أثناء تحديث الطبيب", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطبيب؟")) return

    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم حذف الطبيب بنجاح", "success")
        fetchProviders()
      } else {
        showAlert(result.error || "حدث خطأ أثناء حذف الطبيب", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    }
  }

  // دالة التحقق من الحقول المطلوبة في نموذج الطبيب
  const validateFormData = (): boolean => {
    const required = [
      { key: "name", label: "اسم الطبيب" },
      { key: "title", label: "اللقب" },
      { key: "specialty", label: "التخصص" },
      { key: "consultationFee", label: "سعر الكشف" },
    ]

    for (const field of required) {
      const val = (formData as any)[field.key]
      if (val === undefined || val === null || String(val).trim() === "") {
        showAlert(`حقل ${field.label} مطلوب`, "error")
        return false
      }
    }

    // ensure consultationFee is a number
    if (Number.isNaN(Number.parseInt(formData.consultationFee || ""))) {
      showAlert("حقل سعر الكشف غير صحيح", "error")
      return false
    }

    return true
  }

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
            <UserRound className="w-6 h-6 text-primary" />
            الأطباء
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة الأطباء المسجلين</p>
        </div>
        <Button onClick={handleAddProvider} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة طبيب
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن طبيب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchProviders(searchTerm)
                  }
                }}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={() => fetchProviders(searchTerm)} className="gap-2 bg-transparent">
              <Search className="w-4 h-4" />
              بحث
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                fetchProviders()
              }}
              className="gap-2 bg-transparent"
            >
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
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserRound className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد أطباء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider._id || (provider as any).id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {provider.profileImage ? (
                      <Image
                        src={provider.profileImage || "/placeholder.svg"}
                        alt={provider.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserRound className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate">{provider.name}</h3>
                      {provider.isVerified && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">موثق</span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{provider.title}</p>

                    {((typeof provider.phone === "string" && provider.phone.trim() !== "") ||
                      (Array.isArray(provider.phone) && provider.phone.length > 0)) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">
                          {typeof provider.phone === "string" ? provider.phone.split(",")[0].trim() : provider.phone[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const num = provider.phone
                              ? typeof provider.phone === "string"
                                ? provider.phone.split(",")[0].trim()
                                : provider.phone[0]
                              : ""
                            if (navigator.clipboard && num) navigator.clipboard.writeText(num)
                            showAlert("تم نسخ رقم الهاتف", "success")
                          }}
                          className="text-xs text-primary underline ml-2"
                        >
                          نسخ
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Briefcase className="w-3 h-3" />
                      <span className="truncate">
                        {typeof provider.specialty === "string"
                          ? provider.specialty
                          : (provider.specialty as any)?.name || "غير محدد"}
                      </span>
                    </div>

                    {(provider.clinic || provider.medicalCenter) && (
                      <div className="flex flex-col gap-1 mt-2 text-xs">
                        {provider.clinic && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">
                              عيادة: {typeof provider.clinic === "string" ? provider.clinic : provider.clinic.name}
                            </span>
                          </div>
                        )}
                        {provider.medicalCenter && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Hospital className="w-3 h-3" />
                            <span className="truncate">
                              مركز:{" "}
                              {typeof provider.medicalCenter === "string"
                                ? provider.medicalCenter
                                : provider.medicalCenter.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* </CHANGE> */}

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{provider.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({provider.reviewsCount || 0} تقييم)</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          provider.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {provider.isActive ? "نشط" : "غير نشط"}
                      </span>
                      {provider.isFeatured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">مميز</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleEditProvider(provider)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider._id || (provider as any).id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <ProviderModalForm
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          titles={titles}
          clinics={clinics}
          medicalCenters={medicalCenters}
          saving={saving}
          onSave={handleSaveProvider}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <ProviderModalForm
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          titles={titles}
          clinics={clinics}
          medicalCenters={medicalCenters}
          saving={saving}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false)
            setEditingProvider(null)
          }}
        />
      )}
    </div>
  )
}
