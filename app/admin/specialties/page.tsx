"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search, X, Loader2, RefreshCw, FolderHeart } from "lucide-react"

interface Specialty {
  _id: string
  name: string
  nameEn: string
  description?: string
  icon?: string
  image?: string
  isActive: boolean
  order: number
}

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    icon: "",
    image: "",
    isActive: true,
    order: 0,
  })

  const fetchSpecialties = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/specialties?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setSpecialties(result.specialties || result.data || [])
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب التخصصات", "error")
        setSpecialties([]) // Reset to empty array on error
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
      setSpecialties([]) // Reset to empty array on error
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchSpecialties()
  }, [fetchSpecialties])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleAddSpecialty = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      icon: "",
      image: "",
      isActive: true,
      order: specialties.length,
    })
    setShowAddModal(true)
  }

  const handleEditSpecialty = (specialty: Specialty) => {
    setEditingSpecialty(specialty)
    setFormData({
      name: specialty.name,
      nameEn: specialty.nameEn,
      description: specialty.description || "",
      icon: specialty.icon || "",
      image: specialty.image || "",
      isActive: specialty.isActive,
      order: specialty.order,
    })
    setShowEditModal(true)
  }

  const handleSaveSpecialty = async () => {
    if (!formData.name || !formData.nameEn) {
      showAlert("الرجاء ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم إضافة التخصص بنجاح", "success")
        setShowAddModal(false)
        fetchSpecialties()
      } else {
        showAlert(result.error || "حدث خطأ أثناء إضافة التخصص", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingSpecialty || !formData.name || !formData.nameEn) {
      showAlert("الرجاء ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/specialties/${editingSpecialty._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم تحديث التخصص بنجاح", "success")
        setShowEditModal(false)
        setEditingSpecialty(null)
        fetchSpecialties()
      } else {
        showAlert(result.error || "حدث خطأ أثناء تحديث التخصص", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSpecialty = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التخصص؟")) return

    try {
      const response = await fetch(`/api/specialties/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم حذف التخصص بنجاح", "success")
        fetchSpecialties()
      } else {
        showAlert(result.error || "حدث خطأ أثناء حذف التخصص", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    }
  }

  const ModalForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{isEdit ? "تعديل التخصص" : "إضافة تخصص جديد"}</h3>
          <button
            onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}
            className="p-1 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم التخصص (عربي) *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: طب الأطفال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">اسم التخصص (إنجليزي) *</label>
            <Input
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="Example: Pediatrics"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف التخصص..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">رابط الصورة</label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الترتيب</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm">
              نشط
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={isEdit ? handleSaveEdit : handleSaveSpecialty} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {isEdit ? "حفظ التعديلات" : "إضافة"}
            </Button>
            <Button variant="outline" onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

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
            <FolderHeart className="w-6 h-6 text-primary" />
            التخصصات الطبية
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة التخصصات الطبية المتاحة</p>
        </div>
        <Button onClick={handleAddSpecialty} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة تخصص
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن تخصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" onClick={fetchSpecialties} className="gap-2 bg-transparent">
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
      ) : specialties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderHeart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد تخصصات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty) => (
            <Card key={specialty._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{specialty.name}</h3>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {specialty.nameEn}
                    </p>
                    {specialty.description && <p className="text-sm mt-2 line-clamp-2">{specialty.description}</p>}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          specialty.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {specialty.isActive ? "نشط" : "غير نشط"}
                      </span>
                      <span className="text-xs text-muted-foreground">الترتيب: {specialty.order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSpecialty(specialty)}
                      className="p-2 hover:bg-muted rounded-lg text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSpecialty(specialty._id)}
                      className="p-2 hover:bg-muted rounded-lg text-red-600"
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

      {showAddModal && <ModalForm />}
      {showEditModal && <ModalForm isEdit />}
    </div>
  )
}
