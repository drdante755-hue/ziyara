"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search, X, Loader2, Building2, MapPin, Phone, Clock } from "lucide-react"

interface IClinic {
  _id: string
  name: string
  nameAr?: string // Added nameAr to match model
  nameEn?: string
  clinicType: "medical_center" | "private_clinic"
  description?: string
  address: string // Added address field
  city: string
  area: string
  governorate?: string
  phone: string | string[]
  email?: string
  specialties: string[]
  workingHours: Array<{
    day: string
    isOpen: boolean
    openTime: string
    closeTime: string
  }>
  images: string[]
  rating: number
  reviewsCount: number
  isActive: boolean
  isFeatured: boolean
  slotDuration?: number
  defaultStartTime?: string
  defaultEndTime?: string
}

type WorkingHour = {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface ClinicFormData {
  name: string
  nameAr: string
  nameEn: string
  clinicType: "medical_center" | "private_clinic"
  description: string
  address: string
  city: string
  area: string
  governorate: string
  phone: string
  email: string
  specialties: string[]
  customSpecialty: string
  workingHours: WorkingHour[]
  images: string
  isActive: boolean
  isFeatured: boolean
  slotDuration: number
  defaultStartTime: string
  defaultEndTime: string
}

const CLINIC_SPECIALTIES = [
  "طب عام",
  "طب الأسرة",
  "طب الأطفال",
  "طب النساء والتوليد",
  "طب الباطنة",
  "جراحة عامة",
  "جراحة العظام",
  "جراحة المسالك البولية",
  "طب العيون",
  "طب الأنف والأذن والحنجرة",
  "طب الأسنان",
  "طب الجلدية",
  "طب القلب",
  "طب الصدر والجهاز التنفسي",
  "طب الأعصاب",
  "الطب النفسي",
  "طب الروماتيزم",
  "طب الغدد الصماء والسكري",
  "طب الكلى",
  "طب الجهاز الهضمي",
  "طب الأورام",
  "طب التجميل",
  "العلاج الطبيعي",
  "التغذية العلاجية",
  "طب الطوارئ",
  "الأشعة والتصوير الطبي",
  "المختبرات والتحاليل",
]

function ClinicModalForm({
  isEdit,
  formData,
  setFormData,
  governorates,
  saving,
  onSave,
  onClose,
}: {
  isEdit: boolean
  formData: ClinicFormData
  setFormData: React.Dispatch<React.SetStateAction<ClinicFormData>>
  governorates: string[]
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  const handleAddCustomSpecialty = () => {
    const trimmed = formData.customSpecialty.trim()
    if (trimmed && !formData.specialties.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, trimmed],
        customSpecialty: "",
      }))
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }))
  }

  const handleToggleSpecialty = (specialty: string) => {
    if (formData.specialties.includes(specialty)) {
      handleRemoveSpecialty(specialty)
    } else {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialty],
      }))
    }
  }

  const weekDays = [
    { key: "sunday", label: "الأحد" },
    { key: "monday", label: "الاثنين" },
    { key: "tuesday", label: "الثلاثاء" },
    { key: "wednesday", label: "الأربعاء" },
    { key: "thursday", label: "الخميس" },
    { key: "friday", label: "الجمعة" },
    { key: "saturday", label: "السبت" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{isEdit ? "تعديل العيادة" : "إضافة عيادة جديدة"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نوع العيادة *</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.clinicType === "private_clinic"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="clinicType"
                  value="private_clinic"
                  checked={formData.clinicType === "private_clinic"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinicType: e.target.value as "private_clinic" }))}
                  className="sr-only"
                />
                <Building2 className="w-5 h-5" />
                <span>عيادة خاصة</span>
              </label>
              {/* medical_center option removed intentionally */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم العيادة (عربي) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: عيادة الشفاء"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم العيادة (إنجليزي)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Example: Al-Shifa Clinic"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="وصف العيادة..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المحافظة *</label>
              <select
                value={formData.governorate}
                onChange={(e) => setFormData((prev) => ({ ...prev, governorate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="مثال: مدينة نصر"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المنطقة</label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                placeholder="مثال: الحي العاشر"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">العنوان التفصيلي</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="مثال: شارع النصر، عمارة 5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف * (افصل بفاصلة لأكثر من رقم)</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="01xxxxxxxxx, 01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="clinic@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">التخصصات</label>

            {/* التخصصات المختارة */}
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* قائمة التخصصات */}
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto bg-muted/30">
              {CLINIC_SPECIALTIES.map((specialty) => (
                <label
                  key={specialty}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm cursor-pointer transition-colors ${
                    formData.specialties.includes(specialty)
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleToggleSpecialty(specialty)}
                    className="sr-only"
                  />
                  {specialty}
                </label>
              ))}
            </div>

            {/* حقل إضافة تخصص مخصص */}
            <div className="flex gap-2 mt-2">
              <Input
                value={formData.customSpecialty}
                onChange={(e) => setFormData((prev) => ({ ...prev, customSpecialty: e.target.value }))}
                placeholder="أضف تخصص آخر..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomSpecialty()
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomSpecialty}
                disabled={!formData.customSpecialty.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">روابط الصور (افصل بفاصلة)</label>
            <Input
              value={formData.images}
              onChange={(e) => setFormData((prev) => ({ ...prev, images: e.target.value }))}
              placeholder="https://..., https://..."
              dir="ltr"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              نشطة
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded"
              />
              مميزة
            </label>
          </div>

          <div className="border-t pt-4 mt-4 space-y-4">
            <h4 className="font-bold text-md flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              إعدادات المواعيد والعمل
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">مدة الكشف (بالدقائق)</label>
                <Input
                  type="number"
                  value={formData.slotDuration || 30}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slotDuration: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">أيام العمل</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {weekDays.map((day) => {
                    const isSelected = formData.workingHours.find((wh) => wh.day === day.label)?.isOpen
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: prev.workingHours.map((wh) =>
                              wh.day === day.label ? { ...wh, isOpen: !wh.isOpen } : wh,
                            ),
                          }))
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-background text-muted-foreground border-border"
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
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
    </div>
  )
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<IClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  const defaultWorkingHours: WorkingHour[] = [
    { day: "السبت", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الأحد", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الاثنين", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الثلاثاء", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الأربعاء", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الخميس", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "الجمعة", isOpen: false, openTime: "", closeTime: "" },
  ]

  const [formData, setFormData] = useState<ClinicFormData>({
    name: "",
    nameAr: "",
    nameEn: "",
    clinicType: "private_clinic",
    description: "",
    address: "",
    city: "",
    area: "",
    governorate: "القاهرة",
    phone: "",
    email: "",
    specialties: [],
    customSpecialty: "",
    workingHours: defaultWorkingHours,
    images: "",
    isActive: true,
    isFeatured: false,
    slotDuration: 30,
    defaultStartTime: "09:00",
    defaultEndTime: "21:00",
  })

  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "الشرقية",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
  ]

  const fetchClinics = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      // Only fetch private clinics for this admin page
      params.append("clinicType", "private_clinic")

      const response = await fetch(`/api/clinics?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const clinicsData = (result.clinics || result.data || []).map((clinic: any) => ({
          ...clinic,
          _id: clinic._id || clinic.id,
        }))
        setClinics(clinicsData)
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب العيادات", "error")
        setClinics([])
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
      setClinics([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClinics()
  }, [fetchClinics])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const onAdd = () => {
    setFormData({
      name: "",
      nameAr: "",
      nameEn: "",
      clinicType: "private_clinic",
      description: "",
      address: "",
      city: "",
      area: "",
      governorate: "القاهرة",
      phone: "",
      email: "",
      specialties: [],
      customSpecialty: "",
      workingHours: defaultWorkingHours,
      images: "",
      isActive: true,
      isFeatured: false,
      slotDuration: 30,
      defaultStartTime: "09:00",
      defaultEndTime: "21:00",
    })
    setEditId(null)
    setIsAddModalOpen(true)
  }

  const onEdit = (clinic: IClinic) => {
    setFormData({
      name: clinic.name,
      nameAr: clinic.nameAr || "",
      nameEn: clinic.nameEn || "",
      clinicType: clinic.clinicType,
      description: clinic.description || "",
      address: clinic.address || "",
      city: clinic.city || "",
      area: clinic.area || "",
      governorate: clinic.governorate || "القاهرة",
      phone: Array.isArray(clinic.phone) ? clinic.phone.join(", ") : clinic.phone,
      email: clinic.email || "",
      specialties: clinic.specialties || [],
      customSpecialty: "",
      workingHours: clinic.workingHours.length > 0 ? clinic.workingHours : defaultWorkingHours,
      images: clinic.images?.[0] || "",
      isActive: clinic.isActive,
      isFeatured: clinic.isFeatured,
      slotDuration: clinic.slotDuration || 30,
      defaultStartTime: clinic.defaultStartTime || "09:00",
      defaultEndTime: clinic.defaultEndTime || "21:00",
    })
    setEditId(clinic._id)
    setIsAddModalOpen(true)
  }

  const validateFormData = (): boolean => {
    const requiredFields = [
      { key: "name", label: "اسم العيادة (عربي)" },
      { key: "city", label: "المدينة" },
      { key: "governorate", label: "المحافظة" },
      { key: "phone", label: "رقم الهاتف" },
    ]

    for (const field of requiredFields) {
      const value = formData[field.key as keyof ClinicFormData]
      if (!value || String(value).trim() === "") {
        showAlert(`حقل ${field.label} مطلوب`, "error")
        return false
      }
    }

    const phones = formData.phone
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    if (phones.length === 0) {
      showAlert("يجب إدخال رقم هاتف واحد على الأقل", "error")
      return false
    }

    return true
  }

  const onSave = async () => {
    if (!validateFormData()) {
      return
    }

    try {
      setSaving(true)
      const clinicData = {
        ...formData,
        phone: formData.phone.split(",").map((p) => p.trim()),
        images: formData.images ? [formData.images] : [],
      }

      const url = editId ? `/api/clinics/${editId}` : "/api/clinics"
      const method = editId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicData),
      })

      const result = await res.json()

      if (result.success) {
        showAlert("تم إضافة العيادة بنجاح", "success")
        setIsAddModalOpen(false)
        fetchClinics()
      } else {
        showAlert(result.error || "حدث خطأ أثناء إضافة العيادة", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (clinic: IClinic) => {
    if (!confirm("هل أنت متأكد من حذف هذه العيادة؟")) return

    const clinicId = clinic._id
    if (!clinicId) {
      showAlert("حدث خطأ: لا يمكن تحديد العيادة", "error")
      return
    }

    try {
      const response = await fetch(`/api/clinics/${clinicId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم حذف العيادة بنجاح", "success")
        fetchClinics()
      } else {
        showAlert(result.error || "حدث خطأ أثناء حذف العيادة", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    }
  }

  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      searchTerm === "" ||
      clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-background p-6">
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
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            العيادات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة العيادات المسجلة</p>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة عيادة
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن العيادات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="flex items-center">
              <span className="text-sm text-muted-foreground">عدد العيادات: {clinics.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد عيادات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClinics.map((clinic) => (
                <Card key={clinic._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{clinic.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" />
                              {clinic.clinicType === "private_clinic" ? "عيادة خاصة" : "مركز طبي"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEdit(clinic)}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(clinic)}
                              className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {[clinic.city, clinic.area, clinic.address, clinic.governorate].filter(Boolean).join(", ")}
                          </span>
                        </div>
                        {((typeof clinic.phone === "string" && clinic.phone.trim() !== "") ||
                          (Array.isArray(clinic.phone) && clinic.phone.length > 0)) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">
                              {typeof clinic.phone === "string" ? clinic.phone.split(",")[0].trim() : clinic.phone[0]}
                            </span>
                          </div>
                        )}
                        {clinic.specialties?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {clinic.specialties.slice(0, 3).map((specialty, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                                {typeof specialty === "string" ? specialty : (specialty as any).name}
                              </span>
                            ))}
                            {clinic.specialties.length > 3 && (
                              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                                +{clinic.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        {typeof clinic.slotDuration === "number" && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <span className="font-bold">مدة الكشف:</span>
                            <span>{clinic.slotDuration} دقيقة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <ClinicModalForm
          isEdit={!!editId}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={onSave}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditId(null)
          }}
        />
      )}
    </div>
  )
}
