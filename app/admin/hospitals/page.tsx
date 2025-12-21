"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
  Hospital,
  MapPin,
  Phone,
  Bed,
  AlertTriangle,
} from "lucide-react"

const HOSPITAL_DEPARTMENTS = [
  "قسم الطوارئ",
  "قسم العناية المركزة",
  "قسم الباطنة",
  "قسم الجراحة العامة",
  "قسم جراحة العظام",
  "قسم جراحة القلب والأوعية الدموية",
  "قسم جراحة المخ والأعصاب",
  "قسم النساء والتوليد",
  "قسم الأطفال",
  "قسم حديثي الولادة",
  "قسم الأورام",
  "قسم العلاج الطبيعي",
  "قسم الأشعة",
  "قسم المختبرات",
  "قسم العيون",
  "قسم الأنف والأذن والحنجرة",
  "قسم الجلدية",
  "قسم المسالك البولية",
  "قسم القلب",
  "قسم الصدر",
  "قسم الكلى والغسيل الكلوي",
  "قسم الغدد الصماء والسكري",
  "قسم الروماتيزم",
  "قسم الطب النفسي",
  "قسم التغذية العلاجية",
  "قسم الأسنان",
  "قسم التجميل",
]

interface HospitalData {
  _id: string
  name: string
  nameEn?: string
  description?: string
  // API may return `address` as a string or an object; accept both shapes
  address:
    | string
    | {
        street?: string
        city: string
        area?: string
        governorate: string
      }
  // some endpoints may expose `city`/`area` at top-level — allow that
  city?: string
  area?: string
  phone: string[]
  email?: string
  departments: string[] // تغيير النوع ليكون مصفوفة نصوص
  facilities: string[]
  totalBeds?: number
  hasEmergency: boolean
  hasICU: boolean
  images: string[]
  rating: number
  reviewsCount: number
  isActive: boolean
  isFeatured: boolean
}

interface HospitalFormData {
  name: string
  nameEn: string
  description: string
  street: string
  city: string
  area: string
  governorate: string
  phone: string
  email: string
  departments: string[] // تغيير من departmentIds إلى departments
  customDepartment: string // إضافة حقل للقسم المخصص
  facilities: string
  totalBeds: string
  hasEmergency: boolean
  hasICU: boolean
  images: string
  isActive: boolean
  isFeatured: boolean
}

function HospitalModalForm({
  isEdit,
  formData,
  setFormData,
  governorates,
  saving,
  onSave,
  onClose,
}: {
  isEdit: boolean
  formData: HospitalFormData
  setFormData: React.Dispatch<React.SetStateAction<HospitalFormData>>
  governorates: string[]
  saving: boolean
  onSave: () => void
  onClose: () => void
}) {
  const handleAddCustomDepartment = () => {
    if (formData.customDepartment.trim() && !formData.departments.includes(formData.customDepartment.trim())) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, prev.customDepartment.trim()],
        customDepartment: "",
      }))
    }
  }

  const handleSelectDepartment = (dept: string) => {
    if (!formData.departments.includes(dept)) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, dept],
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{isEdit ? "تعديل المستشفى" : "إضافة مستشفى جديد"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستشفى (عربي) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: مستشفى النور"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستشفى (إنجليزي)</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Example: Al-Nour Hospital"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="وصف المستشفى..."
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
                placeholder="مثال: شارع الجمهورية"
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
                placeholder="hospital@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">عدد الأسرة</label>
              <Input
                type="number"
                value={formData.totalBeds}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalBeds: e.target.value }))}
                placeholder="مثال: 200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المرافق (افصل بفاصلة)</label>
              <Input
                value={formData.facilities}
                onChange={(e) => setFormData((prev) => ({ ...prev, facilities: e.target.value }))}
                placeholder="مثال: موقف سيارات, كافيتريا, صيدلية"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الأقسام</label>

            {/* الأقسام المختارة */}
            {formData.departments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.departments.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {dept}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          departments: prev.departments.filter((d) => d !== dept),
                        }))
                      }
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* قائمة منسدلة لاختيار الأقسام */}
            <div className="mb-3">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectDepartment(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">اختر قسماً من القائمة...</option>
                {HOSPITAL_DEPARTMENTS.filter((dept) => !formData.departments.includes(dept)).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* إضافة قسم مخصص */}
            <div className="flex gap-2">
              <Input
                value={formData.customDepartment}
                onChange={(e) => setFormData((prev) => ({ ...prev, customDepartment: e.target.value }))}
                placeholder="أو أضف قسم آخر غير موجود في القائمة..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomDepartment()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomDepartment}
                disabled={!formData.customDepartment.trim()}
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

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasEmergency}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasEmergency: e.target.checked }))}
                className="rounded"
              />
              قسم طوارئ
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasICU}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasICU: e.target.checked }))}
                className="rounded"
              />
              عناية مركزة
            </label>
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

export default function HospitalsAdmin() {
  const [hospitals, setHospitals] = useState<HospitalData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingHospital, setEditingHospital] = useState<HospitalData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "الشرقية",
    "المنوفية",
    "الغربية",
    "كفر الشيخ",
    "البحيرة",
    "دمياط",
    "بورسعيد",
    "الإسماعيلية",
    "السويس",
    "شمال سيناء",
    "جنوب سيناء",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "البحر الأحمر",
    "الوادي الجديد",
    "مطروح",
  ]

  const initialFormData: HospitalFormData = {
    name: "",
    nameEn: "",
    description: "",
    street: "",
    city: "",
    area: "",
    governorate: "القاهرة",
    phone: "",
    email: "",
    departments: [],
    customDepartment: "",
    facilities: "",
    totalBeds: "",
    hasEmergency: false,
    hasICU: false,
    images: "",
    isActive: true,
    isFeatured: false,
  }

  const [formData, setFormData] = useState<HospitalFormData>(initialFormData)

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hospitals")
      if (response.ok) {
        const data = await response.json()
        const hospitalsData = (data.hospitals || []).map((h: any) => {
          // normalize id
          const _id = h._id || h.id

          // normalize phone to always be an array of strings
          let phoneArr: string[] = []
          if (Array.isArray(h.phone)) phoneArr = h.phone.map((p: any) => String(p).trim()).filter(Boolean)
          else if (typeof h.phone === "string") phoneArr = h.phone.split(",").map((p: string) => p.trim()).filter(Boolean)

          return {
            ...h,
            _id,
            phone: phoneArr,
            departments: h.departments || [],
            images: h.images || [],
            isActive: typeof h.isActive === "boolean" ? h.isActive : true,
          }
        })
        setHospitals(hospitalsData)
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHospitals()
  }, [fetchHospitals])

  // helpers to safely read city/area/governorate from possible address shapes
  const getHospitalCity = (h: HospitalData) => (typeof h.address === "object" ? h.address.city : h.city || "")
  const getHospitalArea = (h: HospitalData) => (typeof h.address === "object" ? h.address.area || "" : h.area || "")
  const getHospitalGovernorate = (h: HospitalData) => (typeof h.address === "object" ? h.address.governorate : undefined)

  const handleEdit = (hospital: HospitalData) => {
    setEditingHospital(hospital)
    setFormData({
      name: hospital.name,
      nameEn: hospital.nameEn || "",
      description: hospital.description || "",
      // address may be string or object depending on API shape
      street: (typeof hospital.address === "object" ? hospital.address?.street : hospital.address) || "",
      city: getHospitalCity(hospital) || "",
      area: getHospitalArea(hospital) || "",
      governorate: getHospitalGovernorate(hospital) || "القاهرة",
      phone: hospital.phone?.join(", ") || "",
      email: hospital.email || "",
      departments: hospital.departments || [],
      customDepartment: "",
      facilities: hospital.facilities?.join(", ") || "",
      totalBeds: hospital.totalBeds?.toString() || "",
      hasEmergency: hospital.hasEmergency || false,
      hasICU: hospital.hasICU || false,
      images: hospital.images?.join(", ") || "",
      isActive: hospital.isActive ?? true,
      isFeatured: hospital.isFeatured || false,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const hospitalPayload = {
        // API requires both name and nameAr
        name: formData.nameEn || formData.name,
        nameAr: formData.name,
        description: formData.description || undefined,
        // server expects address as a string and separate city/area
        address: `${formData.street?.trim() ? formData.street.trim() + ", " : ""}${
          formData.area?.trim() ? formData.area.trim() + ", " : ""
        }${formData.city}`,
        city: formData.city,
        area: formData.area,
        // server expects phone as a single string
        phone: formData.phone?.trim() || "",
        email: formData.email || undefined,
        departments: formData.departments, // إرسال الأقسام كمصفوفة نصوص
        facilities: formData.facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        totalBeds: formData.totalBeds ? Number.parseInt(formData.totalBeds) : undefined,
        hasEmergency: formData.hasEmergency,
        hasICU: formData.hasICU,
        images: formData.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      }

      const url = editingHospital ? `/api/hospitals/${editingHospital._id}` : "/api/hospitals"
      const method = editingHospital ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalPayload),
      })

      if (response.ok) {
        await fetchHospitals()
        setShowModal(false)
        setEditingHospital(null)
        setFormData(initialFormData)
      } else {
        const error = await response.json()
        alert(error.error || "حدث خطأ")
      }
    } catch (error) {
      console.error("Error saving hospital:", error)
      alert("حدث خطأ في الاتصال")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/hospitals/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchHospitals()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error("Error deleting hospital:", error)
    }
  }

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getHospitalCity(hospital).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستشفيات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وحذف المستشفيات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHospitals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button
            onClick={() => {
              setEditingHospital(null)
              setFormData(initialFormData)
              setShowModal(true)
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستشفى
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن مستشفى..."
            className="pr-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredHospitals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Hospital className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد مستشفيات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital._id || (hospital as any).id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{hospital.name}</h3>
                      {hospital.isFeatured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">مميز</span>
                      )}
                      {!hospital.isActive && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">غير نشط</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getHospitalCity(hospital)}{getHospitalGovernorate(hospital) ? `, ${getHospitalGovernorate(hospital)}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {hospital.phone?.[0]}
                      </span>
                      {hospital.totalBeds && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {hospital.totalBeds} سرير
                        </span>
                      )}
                      {hospital.hasEmergency && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          طوارئ
                        </span>
                      )}
                    </div>
                    {hospital.departments && hospital.departments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hospital.departments.slice(0, 5).map((dept, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                            {typeof dept === "string" ? dept : dept}
                          </span>
                        ))}
                        {hospital.departments.length > 5 && (
                          <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                            +{hospital.departments.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(hospital)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {deleteConfirm === hospital._id ? (
                      <div className="flex gap-1">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(hospital._id)}>
                          تأكيد
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                          إلغاء
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(hospital._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <HospitalModalForm
          isEdit={!!editingHospital}
          formData={formData}
          setFormData={setFormData}
          governorates={governorates}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingHospital(null)
            setFormData(initialFormData)
          }}
        />
      )}
    </div>
  )
}
