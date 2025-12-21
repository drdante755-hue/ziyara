"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search, X, Loader2, RefreshCw, Building2, MapPin, Phone } from "lucide-react"

interface Clinic {
  _id?: string
  id?: string
  name: string
  nameEn?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  address?: string | {
    street?: string
    city: string
    area?: string
    governorate: string
  }
  city?: string
  area?: string
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
}

type WorkingHour = {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface ClinicFormData {
  name: string
  nameEn: string
  description: string
  street: string
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
                value={formData.street}
                onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
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
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
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
    nameEn: "",
    description: "",
    street: "",
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

      const response = await fetch(`/api/clinics?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const clinicsData = (result.clinics || result.data || [])
          // تحويل id إلى _id لضمان توافق مع الكود
          .map((clinic: any) => ({
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

  const handleAddClinic = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      street: "",
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
    })
    setShowAddModal(true)
  }

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic)
    const mappedWorkingHours: WorkingHour[] = clinic.workingHours?.length
      ? clinic.workingHours.map((wh) => ({
          day: wh.day,
          isOpen: wh.isOpen,
          openTime: wh.openTime || "",
          closeTime: wh.closeTime || "",
        }))
      : defaultWorkingHours

    const specialtiesArray =
      clinic.specialties?.map((s) => (typeof s === "string" ? s : (s as any).name || "")).filter(Boolean) || []

    // معالجة العنوان (قد يكون string أو object)
    let street = ""
    let city = ""
    let area = ""
    let governorate = "القاهرة"

    if (typeof clinic.address === "string") {
      // إذا كان address string، حاول تقسيمه
      const parts = clinic.address.split(",").map(p => p.trim())
      street = parts[0] || ""
      area = parts[1] || ""
    } else if (clinic.address && typeof clinic.address === "object") {
      street = clinic.address.street || ""
      city = clinic.address.city || ""
      area = clinic.address.area || ""
      governorate = clinic.address.governorate || "القاهرة"
    }

    // المدينة قد تكون في clinic.city بدلاً من clinic.address.city
    if (!city && clinic.city) {
      city = clinic.city
    }

    // المنطقة قد تكون في clinic.area بدلاً من clinic.address.area
    if (!area && clinic.area) {
      area = clinic.area
    }

    const phoneStr = typeof clinic.phone === "string" ? clinic.phone : (clinic.phone?.join(", ") || "")

    setFormData({
      name: clinic.name || "",
      nameEn: clinic.nameEn || clinic.nameAr || "",
      description: clinic.description || clinic.descriptionAr || "",
      street: street,
      city: city,
      area: area,
      governorate: governorate,
      phone: phoneStr,
      email: clinic.email || "",
      specialties: specialtiesArray,
      customSpecialty: "",
      workingHours: mappedWorkingHours,
      images: clinic.images?.join(", ") || "",
      isActive: clinic.isActive,
      isFeatured: clinic.isFeatured,
    })
    setShowEditModal(true)
  }

  // دالة التحقق من الحقول المطلوبة
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

    // التحقق من أن رقم الهاتف صحيح
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

  const handleSaveClinic = async () => {
    // التحقق من الحقول المطلوبة أولاً
    if (!validateFormData()) {
      return
    }

    try {
      setSaving(true)
      // معالجة أرقام الهاتف
      const phoneArray = formData.phone
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
      
      const payload = {
        name: formData.nameEn || formData.name, // الاسم الإنجليزي أو العربي كقيمة افتراضية
        nameAr: formData.name, // الاسم العربي (مطلوب)
        description: formData.description,
        descriptionAr: formData.description,
        address: `${formData.street}, ${formData.area}`, // دمج العنوان كنص واحد
        city: formData.city,
        area: formData.area,
        phone: phoneArray.join(", "), // إرسال كـ string واحد مدمج
        email: formData.email,
        specialties: formData.specialties || [],
        workingHours: formData.workingHours,
        images: formData.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم إضافة العيادة بنجاح", "success")
        setShowAddModal(false)
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

  const handleSaveEdit = async () => {
    if (!editingClinic) {
      showAlert("حدث خطأ أثناء تحديث العيادة", "error")
      return
    }

    // التحقق من الحقول المطلوبة أولاً
    if (!validateFormData()) {
      return
    }

    try {
      setSaving(true)
      
      // معالجة أرقام الهاتف
      const phoneArray = formData.phone
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
      
      const payload = {
        name: formData.nameEn || formData.name, // الاسم الإنجليزي أو العربي كقيمة افتراضية
        nameAr: formData.name, // الاسم العربي (مطلوب)
        description: formData.description,
        descriptionAr: formData.description,
        address: `${formData.street}, ${formData.area}`, // دمج العنوان كنص واحد
        city: formData.city,
        area: formData.area,
        phone: phoneArray.join(", "), // إرسال كـ string واحد مدمج
        email: formData.email,
        specialties: formData.specialties || [],
        workingHours: formData.workingHours,
        images: formData.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      }

      const response = await fetch(`/api/clinics/${editingClinic._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم تحديث العيادة بنجاح", "success")
        setShowEditModal(false)
        setEditingClinic(null)
        fetchClinics()
      } else {
        showAlert(result.error || "حدث خطأ أثناء تحديث العيادة", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClinic = async (clinic: Clinic) => {
    if (!confirm("هل أنت متأكد من حذف هذه العيادة؟")) return

    const clinicId = clinic._id || clinic.id
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
            <Building2 className="w-6 h-6 text-primary" />
            العيادات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة العيادات المسجلة</p>
        </div>
        <Button onClick={handleAddClinic} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة عيادة
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن عيادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchClinics(searchTerm)
                  }
                }}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={() => fetchClinics(searchTerm)} className="gap-2 bg-transparent">
              <Search className="w-4 h-4" />
              بحث
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                fetchClinics()
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
      ) : clinics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد عيادات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clinics.map((clinic) => (
            <Card key={clinic._id || clinic.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate">{clinic.name}</h3>
                      {clinic.isFeatured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">مميزة</span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          clinic.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {clinic.isActive ? "نشطة" : "غير نشطة"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {
                          // عرض: المدينة ثم المنطقة ثم العنوان التفصيلي (ثم المحافظة إن وُجدت)
                          typeof clinic.address === "string"
                            ? (() => {
                                const parts = clinic.address.split(",").map((p) => p.trim())
                                const streetPart = parts[0] || ""
                                const areaPart = parts[1] || ""
                                return [clinic.city, areaPart, streetPart, clinic.governorate].filter(Boolean).join(", ")
                              })()
                            : clinic.address
                            ? [clinic.address.city, clinic.address.area, clinic.address.street, clinic.address.governorate]
                                .filter(Boolean)
                                .join(", ")
                            : [clinic.city, clinic.area, clinic.governorate].filter(Boolean).join(", ")
                        }
                      </span>
                    </div>

                    {( (typeof clinic.phone === "string" && clinic.phone.trim() !== "") || (Array.isArray(clinic.phone) && clinic.phone.length > 0) ) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{typeof clinic.phone === "string" ? clinic.phone.split(",")[0].trim() : clinic.phone[0]}</span>
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
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClinic(clinic)}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClinic(clinic)}
                      className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <ClinicModalForm
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={handleSaveClinic}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <ClinicModalForm
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false)
            setEditingClinic(null)
          }}
        />
      )}
    </div>
  )
}
