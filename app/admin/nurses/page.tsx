"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, Star, Loader2, RefreshCw, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

interface Nurse {
  _id: string
  name: string
  specialty: string
  experience: string
  phone: string
  available: boolean
  imageUrl?: string
  rating?: number
  reviews?: number
  price?: number
  location?: string
}

const specialtiesOptions = ["حقن", "قياس ضغط", "قياس سكر", "تضميد جروح", "رعاية مسنين", "رعاية أطفال", "علاج طبيعي"]

export default function NursesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState<Partial<Nurse>>({
    name: "",
    specialty: "",
    experience: "",
    phone: "",
    available: true,
    imageUrl: "",
    price: 150,
    location: "",
  })
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const fetchNurses = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)

      const response = await fetch(`/api/admin/services/nurses?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setNurses(data.data)
      } else {
        showAlert("error", data.error || "فشل في جلب البيانات")
      }
    } catch (error) {
      console.error("Error fetching nurses:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchNurses()
  }, [fetchNurses])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleOpenDialog = (nurse?: Nurse) => {
    if (nurse) {
      setEditingId(nurse._id)
      setFormData({
        name: nurse.name,
        specialty: nurse.specialty,
        experience: nurse.experience,
        phone: nurse.phone,
        available: nurse.available,
        imageUrl: nurse.imageUrl || "",
        price: nurse.price || 150,
        location: nurse.location || "",
      })
    } else {
      setEditingId(null)
      setFormData({
        name: "",
        specialty: "",
        experience: "",
        phone: "",
        available: true,
        imageUrl: "",
        price: 150,
        location: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveNurse = async () => {
    if (!formData.name || !formData.phone || !formData.specialty) {
      showAlert("error", "الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    setIsSaving(true)
    try {
      const url = editingId ? `/api/admin/services/nurses/${editingId}` : "/api/admin/services/nurses"

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", editingId ? "تم تحديث الممرض بنجاح" : "تم إضافة الممرض بنجاح")
        setIsDialogOpen(false)
        fetchNurses()
      } else {
        showAlert("error", data.error || "حدث خطأ أثناء الحفظ")
      }
    } catch (error) {
      console.error("Error saving nurse:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNurse = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الممرض؟")) return

    try {
      const response = await fetch(`/api/admin/services/nurses/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم حذف الممرض بنجاح")
        fetchNurses()
      } else {
        showAlert("error", data.error || "حدث خطأ أثناء الحذف")
      }
    } catch (error) {
      console.error("Error deleting nurse:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    }
  }

  const NursesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الممرضين</h1>
          <p className="text-gray-600 mt-1">إضافة وتحديث بيانات الممرضين المتاحين ({nurses.length} ممرض)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNurses} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة ممرض جديد
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="البحث عن ممرض..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Alert */}
      {alert && (
        <Alert className={alert.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <AlertDescription className={alert.type === "success" ? "text-green-800" : "text-red-800"}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Nurses Grid */}
      {isLoading ? (
        <NursesSkeleton />
      ) : nurses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا يوجد ممرضين حالياً</p>
          <Button className="mt-4" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة أول ممرض
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nurses.map((nurse) => (
            <Card key={nurse._id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{nurse.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${nurse.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {nurse.available ? "متاح" : "غير متاح"}
                      </span>
                      {nurse.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{nurse.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">التخصص: {nurse.specialty}</p>
                  <p className="text-sm text-gray-600">الخبرة: {nurse.experience}</p>
                  <p className="text-sm text-gray-600">الهاتف: {nurse.phone}</p>
                  {nurse.location && <p className="text-sm text-gray-600">الموقع: {nurse.location}</p>}
                  {nurse.price && (
                    <p className="text-sm font-semibold text-emerald-600">السعر: {nurse.price} ج.م/ساعة</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleOpenDialog(nurse)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    تحرير
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteNurse(nurse._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "تحرير الممرض" : "إضافة ممرض جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>الاسم الكامل *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            <div>
              <Label>التخصص *</Label>
              <select
                value={formData.specialty || ""}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر التخصص</option>
                {specialtiesOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>سنوات الخبرة</Label>
              <Input
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="مثال: 5 سنوات"
              />
            </div>

            <div>
              <Label>رقم الهاتف *</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <Label>الموقع</Label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="المحافظة - المنطقة"
              />
            </div>

            <div>
              <Label>السعر (ج.م/ساعة)</Label>
              <Input
                type="number"
                value={formData.price || 150}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div>
              <Label>رابط الصورة (اختياري)</Label>
              <Input
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>متاح للحجز</Label>
              <Switch
                checked={formData.available ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              إلغاء
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveNurse} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
