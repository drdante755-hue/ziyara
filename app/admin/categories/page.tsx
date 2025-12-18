"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Category {
  _id: string
  name: string
  color: string
  icon: string
  products: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#10b981",
  })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")

  // جلب الأقسام من API
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/categories")
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      } else {
        showAlertMessage(data.error || "فشل في جلب الأقسام", "error")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      showAlertMessage("فشل في ��لاتصال بالخادم", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم��")) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        setCategories(categories.filter((c) => c._id !== id))
        showAlertMessage("تم حذف القسم بنجاح")
      } else {
        showAlertMessage(data.error || "فشل في حذف القسم", "error")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      showAlertMessage("فشل في حذف القسم", "error")
    }
  }

  const handleOpenDialog = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        color: category.color,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: "",
        color: "#10b981",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: "", color: "#10b981" })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showAlertMessage("يرجى إدخال اسم القسم", "error")
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCategory) {
        // تحديث قسم موجود
        const response = await fetch(`/api/admin/categories/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const data = await response.json()

        if (data.success) {
          setCategories(categories.map((c) => (c._id === editingCategory._id ? data.category : c)))
          showAlertMessage("تم تحديث القسم بنجاح")
          handleCloseDialog()
        } else {
          showAlertMessage(data.error || "فشل في تحديث القسم", "error")
        }
      } else {
        // إضافة قسم جديد
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const data = await response.json()

        if (data.success) {
          setCategories([data.category, ...categories])
          showAlertMessage("تم إضافة القسم بنجاح")
          handleCloseDialog()
        } else {
          showAlertMessage(data.error || "فشل في إضافة القسم", "error")
        }
      }
    } catch (error) {
      console.error("Error saving category:", error)
      showAlertMessage("فشل في حفظ القسم", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة الأقسام</h1>
            <p className="text-gray-600 mt-1">جاري التحميل...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert */}
      {showAlert && (
        <div
          className={`${
            alertType === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          } border px-4 py-3 rounded-lg flex items-center justify-between`}
        >
          <span>{alertMessage}</span>
          <button onClick={() => setShowAlert(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الأقسام</h1>
          <p className="text-gray-600 mt-1">إجمالي الأقسام: {categories.length}</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم جديد
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد أقسام حالياً</p>
          <Button onClick={() => handleOpenDialog()} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
            إضافة أول قسم
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: category.color }}
                  >
                    📁
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDialog(category)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">عدد المنتجات</span>
                  <span className="font-bold text-emerald-600">{category.products}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم القسم</Label>
              <Input
                id="name"
                placeholder="أدخل اسم القسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-right"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label htmlFor="color">اللون</Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <span className="text-gray-600 text-sm">{formData.color}</span>
              </div>
            </div>

            {/* ملاحظة عن عدد المنتجات */}
            <p className="text-sm text-gray-500">
              عدد المنتجات يتم حسابه تلقائياً بناءً على المنتجات المضافة في هذا القسم
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : editingCategory ? (
                "تحديث"
              ) : (
                "إضافة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
