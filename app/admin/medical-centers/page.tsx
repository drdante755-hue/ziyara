"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search, X, Loader2, Hospital, MapPin, Phone, Star } from "lucide-react"

interface MedicalCenter {
  _id?: string
  id?: string
  name: string
  nameEn?: string
  nameAr?: string
  clinicType: "medical_center"
  description?: string
  descriptionAr?: string
  address?:
    | string
    | {
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

interface FormData {
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

const MEDICAL_SPECIALTIES = [
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

function MedicalCenterModalForm({
  isEdit,
  formData,
  setFormData,
  governorates,
  saving,
  onSave,
  onClose,
  availableClinics,
  selectedClinicIds,
  setSelectedClinicIds,
}: {
  isEdit: boolean
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  governorates: string[]
  saving: boolean
  onSave: () => void
  onClose: () => void
  availableClinics?: any[]
  selectedClinicIds?: string[]
  setSelectedClinicIds?: React.Dispatch<React.SetStateAction<string[]>>
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
          <h3 className="text-lg font-bold text-teal-600">{isEdit ? "تعديل المركز الطبي" : "إضافة مركز طبي جديد"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المركز (عربي) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: مركز الشفاء الطبي"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المركز (إنجليزي)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Example: Al-Shifa Medical Center"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="وصف المركز الطبي..."
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
                placeholder="center@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">التخصصات</label>

            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="hover:bg-teal-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto bg-muted/30">
              {MEDICAL_SPECIALTIES.map((specialty) => (
                <label
                  key={specialty}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm cursor-pointer transition-colors ${
                    formData.specialties.includes(specialty) ? "bg-teal-600 text-white" : "bg-background hover:bg-muted"
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

          {/* Clinics multi-select for attaching clinics to this center */}
          <div>
            <label className="block text-sm font-medium mb-1">ربط عيادات بالمركز (اختياري)</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-muted/30">
              {availableClinics && availableClinics.length > 0 ? (
                availableClinics.map((clinic) => {
                  const cid = clinic._id || clinic.id
                  const checked = selectedClinicIds?.includes(cid)
                  return (
                    <label key={cid} className="flex items-center gap-2 p-1 hover:bg-muted rounded">
                      <input
                        type="checkbox"
                        checked={!!checked}
                        onChange={() => {
                          if (!setSelectedClinicIds) return
                          setSelectedClinicIds((prev) =>
                            prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid],
                          )
                        }}
                        className="rounded"
                      />
                      <span className="truncate">{clinic.nameAr || clinic.name}</span>
                      {clinic.city ? <span className="text-xs text-muted-foreground ml-2">· {clinic.city}</span> : null}
                    </label>
                  )
                })
              ) : (
                <div className="text-sm text-muted-foreground">لا توجد عيادات متاحة</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              نشط
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isFeatured)}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded"
              />
              مميز
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700">
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

export default function MedicalCentersPage() {
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState<MedicalCenter | null>(null)
  const [availableClinics, setAvailableClinics] = useState<any[]>([])
  const [selectedClinicIds, setSelectedClinicIds] = useState<string[]>([])
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

  const [formData, setFormData] = useState<FormData>({
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

  const fetchMedicalCenters = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/medical-centers?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const centersData = (result.centers || result.data || []).map((center: any) => ({
          ...center,
          _id: center._id || center.id,
        }))
        setMedicalCenters(centersData)
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب المراكز الطبية", "error")
        setMedicalCenters([])
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
      setMedicalCenters([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClinics = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.append("clinicType", "private_clinic")
      params.append("active", "true")
      params.append("limit", "200")

      const res = await fetch(`/api/clinics?${params.toString()}`)
      const data = await res.json()
      if (data?.success) {
        setAvailableClinics(data.clinics || [])
      }
    } catch (e) {
      console.error("Error fetching clinics:", e)
    }
  }, [])

  useEffect(() => {
    fetchMedicalCenters()
    fetchClinics()
  }, [fetchMedicalCenters])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleAddCenter = () => {
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
    setSelectedClinicIds([])
  }

  const handleEditCenter = (center: MedicalCenter) => {
    setEditingCenter(center)
    const mappedWorkingHours: WorkingHour[] = center.workingHours?.length
      ? center.workingHours.map((wh) => ({
          day: wh.day,
          isOpen: wh.isOpen,
          openTime: wh.openTime || "",
          closeTime: wh.closeTime || "",
        }))
      : defaultWorkingHours

    const specialtiesArray =
      center.specialties?.map((s) => (typeof s === "string" ? s : (s as any).name || "")).filter(Boolean) || []

    let street = ""
    let city = ""
    let area = ""
    let governorate = "القاهرة"

    if (typeof center.address === "string") {
      const parts = center.address.split(",").map((p) => p.trim())
      street = parts[0] || ""
      area = parts[1] || ""
    } else if (center.address && typeof center.address === "object") {
      street = center.address.street || ""
      city = center.address.city || ""
      area = center.address.area || ""
      governorate = center.address.governorate || "القاهرة"
    }

    if (!city && center.city) {
      city = center.city
    }

    if (!area && center.area) {
      area = center.area
    }

    const phoneStr = typeof center.phone === "string" ? center.phone : center.phone?.join(", ") || ""

    setFormData({
      name: center.name || "",
      nameEn: center.nameEn || center.nameAr || "",
      description: center.description || center.descriptionAr || "",
      street: street,
      city: city,
      area: area,
      governorate: governorate,
      phone: phoneStr,
      email: center.email || "",
      specialties: specialtiesArray,
      customSpecialty: "",
      workingHours: mappedWorkingHours,
      images: center.images?.join(", ") || "",
      isActive: center.isActive,
      isFeatured: center.isFeatured,
    })
    // preselect clinics that belong to this center
    const centerId = center._id || center.id
    // if clinics already loaded, compute selection, otherwise fetch then compute
    if (availableClinics.length > 0) {
      const selected = availableClinics.filter((c) => c.medicalCenter && (c.medicalCenter._id === centerId || c.medicalCenter === centerId)).map((c) => c._id || c.id)
      setSelectedClinicIds(selected)
    } else {
      fetchClinics().then(() => {
        const selected = (availableClinics || []).filter((c) => c.medicalCenter && (c.medicalCenter._id === centerId || c.medicalCenter === centerId)).map((c) => c._id || c.id)
        setSelectedClinicIds(selected)
      })
    }

    setShowEditModal(true)
  }

  const validateFormData = (): boolean => {
    const requiredFields = [
      { key: "name", label: "اسم المركز (عربي)" },
      { key: "city", label: "المدينة" },
      { key: "governorate", label: "المحافظة" },
      { key: "phone", label: "رقم الهاتف" },
    ]

    for (const field of requiredFields) {
      const value = formData[field.key as keyof FormData]
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

  const handleSaveCenter = async () => {
    if (!validateFormData()) {
      return
    }

    try {
      setSaving(true)

      const phones = formData.phone
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)

      const images = formData.images
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean)

      const addressObj = {
        street: formData.street.trim(),
        city: formData.city.trim(),
        area: formData.area.trim(),
        governorate: formData.governorate,
      }

      const payload: any = {
        name: formData.name.trim(),
        nameAr: formData.name.trim(),
        nameEn: formData.nameEn.trim() || formData.name.trim(),
        description: formData.description.trim(),
        descriptionAr: formData.description.trim(),
        address: addressObj,
        city: formData.city.trim(),
        area: formData.area.trim(),
        governorate: formData.governorate,
        phone: phones,
        email: formData.email.trim(),
        specialties: formData.specialties,
        workingHours: formData.workingHours,
        images: images,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        clinicIds: selectedClinicIds,
      }

      const url = editingCenter
        ? `/api/medical-centers/${editingCenter._id || editingCenter.id}`
        : "/api/medical-centers"
      const method = editingCenter ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        showAlert(editingCenter ? "تم تحديث المركز الطبي بنجاح" : "تم إضافة المركز الطبي بنجاح", "success")
        setShowAddModal(false)
        setShowEditModal(false)
        setEditingCenter(null)
        fetchMedicalCenters()
        // refresh clinics list to reflect new links
        fetchClinics()
      } else {
        showAlert(result.error || "حدث خطأ أثناء حفظ البيانات", "error")
      }
    } catch (error) {
      console.error("Error saving medical center:", error)
      showAlert("حدث خطأ أثناء حفظ البيانات", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCenter = async (centerId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المركز الطبي؟")) {
      return
    }

    try {
      const response = await fetch(`/api/medical-centers/${centerId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم حذف المركز الطبي بنجاح", "success")
        fetchMedicalCenters()
      } else {
        showAlert(result.error || "حدث خطأ أثناء الحذف", "error")
      }
    } catch (error) {
      console.error("Error deleting medical center:", error)
      showAlert("حدث خطأ أثناء الحذف", "error")
    }
  }

  const filteredCenters = medicalCenters.filter((center) => {
    const searchLower = searchTerm.toLowerCase()
    const nameMatch = center.name?.toLowerCase().includes(searchLower)
    const cityMatch = center.city?.toLowerCase().includes(searchLower)
    const areaMatch = center.area?.toLowerCase().includes(searchLower)
    return nameMatch || cityMatch || areaMatch
  })

  return (
    <div className="space-y-6">
      {alert.show && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            alert.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {alert.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-600">المراكز الطبية</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة المراكز الطبية المتخصصة</p>
        </div>
        <Button onClick={handleAddCenter} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مركز طبي
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مركز طبي..."
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : filteredCenters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Hospital className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "لا توجد مراكز طبية مطابقة للبحث" : "لا توجد مراكز طبية"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCenters.map((center) => {
            const centerId = center._id || center.id || ""
            const phoneStr = typeof center.phone === "string" ? center.phone : center.phone?.[0] || "غير متوفر"
            let cityStr = center.city || ""
            let areaStr = center.area || ""

            if (!cityStr && typeof center.address === "object" && center.address) {
              cityStr = center.address.city || ""
              areaStr = center.address.area || ""
            }

            return (
              <Card key={centerId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hospital className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{center.name}</h3>
                        {center.specialties && center.specialties.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">{center.specialties[0]}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditCenter(center)}
                        className="p-1.5 hover:bg-muted rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCenter(centerId)}
                        className="p-1.5 hover:bg-muted rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="truncate">
                        {cityStr && areaStr ? `${cityStr} - ${areaStr}` : cityStr || areaStr || "غير محدد"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="truncate" dir="ltr">
                        {phoneStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{center.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-muted-foreground">({center.reviewsCount || 0} تقييم)</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        center.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {center.isActive ? "نشط" : "غير نشط"}
                    </span>
                    {center.isFeatured && (
                      <span className="px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-700">مميز</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {showAddModal && (
        <MedicalCenterModalForm
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={handleSaveCenter}
          onClose={() => {
            setShowAddModal(false)
            setSelectedClinicIds([])
          }}
          availableClinics={availableClinics}
          selectedClinicIds={selectedClinicIds}
          setSelectedClinicIds={setSelectedClinicIds}
        />
      )}

      {showEditModal && (
        <MedicalCenterModalForm
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={handleSaveCenter}
          onClose={() => {
            setShowEditModal(false)
            setEditingCenter(null)
            setSelectedClinicIds([])
          }}
          
          availableClinics={availableClinics}
          selectedClinicIds={selectedClinicIds}
          setSelectedClinicIds={setSelectedClinicIds}
        />
      )}
    </div>
  )
}
