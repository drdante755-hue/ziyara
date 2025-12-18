"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search, X, Loader2, RefreshCw, UserRound, Star, Briefcase } from "lucide-react"

interface Provider {
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
  hospital?: { _id: string; name: string }
  rating: number
  reviewsCount: number
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  offersHomeVisit: boolean
  offersOnlineConsultation: boolean
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
  qualifications: string
  experience: string
  consultationFee: string
  followUpFee: string
  homeVisitFee: string
  phone: string
  email: string
  clinicId: string
  hospitalId: string
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  offersHomeVisit: boolean
  offersOnlineConsultation: boolean
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

function ProviderModalForm({
  isEdit,
  formData,
  setFormData,
  titles,
  clinics,
  hospitals,
  saving,
  onSave,
  onClose,
}: {
  isEdit: boolean
  formData: ProviderFormData
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>
  titles: string[]
  clinics: Array<{ _id: string; name: string }>
  hospitals: Array<{ _id: string; name: string }>
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

          <div>
            <label className="block text-sm font-medium mb-1">المؤهلات (افصل بفاصلة)</label>
            <Input
              value={formData.qualifications}
              onChange={(e) => setFormData((prev) => ({ ...prev, qualifications: e.target.value }))}
              placeholder="مثال: بكالوريوس طب, ماجستير جراحة"
            />
          </div>

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
                onChange={(e) => setFormData((prev) => ({ ...prev, clinicId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">بدون عيادة</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المستشفى</label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData((prev) => ({ ...prev, hospitalId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">بدون مستشفى</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
    </div>
  )
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [clinics, setClinics] = useState<Array<{ _id: string; name: string }>>([])
  const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([])
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
    qualifications: "",
    experience: "",
    consultationFee: "",
    followUpFee: "",
    homeVisitFee: "",
    phone: "",
    email: "",
    clinicId: "",
    hospitalId: "",
    isActive: true,
    isFeatured: false,
    isVerified: false,
    offersHomeVisit: false,
    offersOnlineConsultation: false,
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
        setProviders(result.providers || result.data || [])
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
        setClinics(result.clinics || result.data || [])
      } else {
        setClinics([])
      }
    } catch (error) {
      console.error("Error fetching clinics:", error)
      setClinics([])
    }
  }

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals?active=true")
      const result = await response.json()
      if (result.success) {
        setHospitals(result.hospitals || result.data || [])
      } else {
        setHospitals([])
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error)
      setHospitals([])
    }
  }

  useEffect(() => {
    fetchProviders()
    fetchClinics()
    fetchHospitals()
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
      qualifications: "",
      experience: "",
      consultationFee: "",
      followUpFee: "",
      homeVisitFee: "",
      phone: "",
      email: "",
      clinicId: "",
      hospitalId: "",
      isActive: true,
      isFeatured: false,
      isVerified: false,
      offersHomeVisit: false,
      offersOnlineConsultation: false,
    })
    setShowAddModal(true)
  }

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider)
    const specialtyValue =
      typeof provider.specialty === "string" ? provider.specialty : (provider.specialty as any)?.name || ""

    setFormData({
      name: provider.name,
      nameEn: provider.nameEn || "",
      title: provider.title,
      bio: provider.bio || "",
      profileImage: provider.profileImage || "",
      specialty: specialtyValue,
      customSpecialty: MEDICAL_SPECIALTIES.includes(specialtyValue) ? "" : specialtyValue,
      subSpecialties: provider.subSpecialties?.join(", ") || "",
      qualifications: provider.qualifications?.join(", ") || "",
      experience: provider.experience?.toString() || "",
      consultationFee: provider.consultationFee?.toString() || "",
      followUpFee: provider.followUpFee?.toString() || "",
      homeVisitFee: provider.homeVisitFee?.toString() || "",
      phone: provider.phone || "",
      email: provider.email || "",
      clinicId: provider.clinic?._id || "",
      hospitalId: provider.hospital?._id || "",
      isActive: provider.isActive,
      isFeatured: provider.isFeatured,
      isVerified: provider.isVerified,
      offersHomeVisit: provider.offersHomeVisit,
      offersOnlineConsultation: provider.offersOnlineConsultation,
    })
    setShowEditModal(true)
  }

  const handleSaveProvider = async () => {
    try {
      setSaving(true)
      const payload = {
        name: formData.name,
        nameEn: formData.nameEn,
        title: formData.title,
        bio: formData.bio,
        profileImage: formData.profileImage,
        specialty: formData.specialty, // إرسال التخصص كـ string
        subSpecialties: formData.subSpecialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        qualifications: formData.qualifications
          .split(",")
          .map((q) => q.trim())
          .filter(Boolean),
        experience: formData.experience ? Number.parseInt(formData.experience) : 0,
        consultationFee: Number.parseInt(formData.consultationFee),
        followUpFee: formData.followUpFee ? Number.parseInt(formData.followUpFee) : undefined,
        homeVisitFee: formData.homeVisitFee ? Number.parseInt(formData.homeVisitFee) : undefined,
        phone: formData.phone,
        email: formData.email,
        clinic: formData.clinicId || undefined,
        hospital: formData.hospitalId || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
        offersHomeVisit: formData.offersHomeVisit,
        offersOnlineConsultation: formData.offersOnlineConsultation,
      }

      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم إضافة الطبيب بنجاح", "success")
        setShowAddModal(false)
        fetchProviders()
      } else {
        showAlert(result.error || "حدث خطأ أثناء إضافة الطبيب", "error")
      }
    } catch (error) {
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

    try {
      setSaving(true)
      const payload = {
        name: formData.name,
        nameEn: formData.nameEn,
        title: formData.title,
        bio: formData.bio,
        profileImage: formData.profileImage,
        specialty: formData.specialty, // إرسال التخصص كـ string
        subSpecialties: formData.subSpecialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        qualifications: formData.qualifications
          .split(",")
          .map((q) => q.trim())
          .filter(Boolean),
        experience: formData.experience ? Number.parseInt(formData.experience) : 0,
        consultationFee: formData.consultationFee ? Number.parseInt(formData.consultationFee) : 0,
        followUpFee: formData.followUpFee ? Number.parseInt(formData.followUpFee) : undefined,
        homeVisitFee: formData.homeVisitFee ? Number.parseInt(formData.homeVisitFee) : undefined,
        phone: formData.phone,
        email: formData.email,
        clinic: formData.clinicId || undefined,
        hospital: formData.hospitalId || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
        offersHomeVisit: formData.offersHomeVisit,
        offersOnlineConsultation: formData.offersOnlineConsultation,
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
            <Card key={provider._id} className="overflow-hidden">
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

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Briefcase className="w-3 h-3" />
                      <span className="truncate">
                        {typeof provider.specialty === "string"
                          ? provider.specialty
                          : (provider.specialty as any)?.name || "غير محدد"}
                      </span>
                    </div>

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
                    onClick={() => handleDeleteProvider(provider._id)}
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
          hospitals={hospitals}
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
          hospitals={hospitals}
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
