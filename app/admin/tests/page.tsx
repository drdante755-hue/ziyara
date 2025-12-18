"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit2, Plus, Loader2, RefreshCw, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

interface LabTest {
  _id: string
  name: string
  price: number
  description?: string
  category: string
  duration: string
  isActive: boolean
}

const categoriesOptions = [
  "تحاليل الدم",
  "تحاليل السكري",
  "تحاليل الكلى",
  "تحاليل الكبد",
  "تحاليل القلب",
  "تحاليل الهرمونات",
  "تحاليل الفيتامينات",
  "تحاليل البول",
]

export default function TestsPage() {
  const [tests, setTests] = useState<LabTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState<Partial<LabTest>>({
    name: "",
    price: 0,
    description: "",
    category: "",
    duration: "24 ساعة",
    isActive: true,
  })
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const fetchTests = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)

      const response = await fetch(`/api/admin/services/tests?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTests(data.data)
      } else {
        showAlert("error", data.error || "فشل في جلب البيانات")
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleOpenDialog = (test?: LabTest) => {
    if (test) {
      setEditingId(test._id)
      setFormData({
        name: test.name,
        price: test.price,
        description: test.description || "",
        category: test.category,
        duration: test.duration,
        isActive: test.isActive,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: "",
        price: 0,
        description: "",
        category: "",
        duration: "24 ساعة",
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveTest = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      showAlert("error", "الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    setIsSaving(true)
    try {
      const url = editingId ? `/api/admin/services/tests/${editingId}` : "/api/admin/services/tests"

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", editingId ? "تم تحديث التحليل بنجاح" : "تم إضافة التحليل بنجاح")
        setIsDialogOpen(false)
        fetchTests()
      } else {
        showAlert("error", data.error || "حدث خطأ أثناء الحفظ")
      }
    } catch (error) {
      console.error("Error saving test:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm("هل تريد حذف هذا التحليل؟")) return

    try {
      const response = await fetch(`/api/admin/services/tests/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم حذف التحليل بنجاح")
        fetchTests()
      } else {
        showAlert("error", data.error || "حدث خطأ أثناء الحذف")
      }
    } catch (error) {
      console.error("Error deleting test:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    }
  }

  const TestsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-20" />
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
          <h1 className="text-3xl font-bold text-gray-800">إدارة التحاليل الطبية</h1>
          <p className="text-gray-600 mt-1">إضافة وتحديث قائمة التحاليل المتاحة ({tests.length} تحليل)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTests} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة تحليل جديد
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="البحث عن تحليل..."
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

      {/* Tests Grid */}
      {isLoading ? (
        <TestsSkeleton />
      ) : tests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا يوجد تحاليل حالياً</p>
          <Button className="mt-4" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة أول تحليل
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test._id} className={`hover:shadow-lg transition-all ${!test.isActive ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${test.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {test.isActive ? "نشط" : "معطل"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {test.description && <p className="text-sm text-gray-600">{test.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{test.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{test.duration}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-2xl font-bold text-emerald-600">{test.price} ج.م</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleOpenDialog(test)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    تحرير
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteTest(test._id)}>
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
            <DialogTitle>{editingId ? "تحرير التحليل" : "إضافة تحليل جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>اسم التحليل *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم التحليل"
              />
            </div>

            <div>
              <Label>السعر (ج.م) *</Label>
              <Input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                min="0"
              />
            </div>

            <div>
              <Label>التصنيف *</Label>
              <select
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">اختر التصنيف</option>
                {categoriesOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>مدة النتائج</Label>
              <Input
                value={formData.duration || ""}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 24 ساعة"
              />
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل وصف التحليل"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>تحليل نشط</Label>
              <Switch
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              إلغاء
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveTest} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
