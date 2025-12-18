"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Copy, Eye, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface Discount {
  _id: string
  code: string
  discount: number
  type: "%" | "ج.م"
  expiryDate: string
  usageCount: number
  maxUsage: number
  status: "نشط" | "غير نشط" | "منتهي"
  description: string
  minOrder: number
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    type: "%",
    expiryDate: "",
    maxUsage: "",
    description: "",
    minOrder: "",
  })

  // Fetch discounts from API
  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/discounts?search=${searchTerm}`)
      const data = await res.json()
      if (data.discounts) {
        setDiscounts(data.discounts)
      }
    } catch (error) {
      showAlert("error", "حدث خطأ في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiscounts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleAddDiscount = async () => {
    if (!formData.code || !formData.discount || !formData.expiryDate) {
      showAlert("error", "يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      setSaving(true)
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          discount: Number.parseInt(formData.discount),
          type: formData.type,
          expiryDate: formData.expiryDate,
          maxUsage: Number.parseInt(formData.maxUsage) || 100,
          description: formData.description,
          minOrder: Number.parseInt(formData.minOrder) || 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showAlert("success", "تم إنشاء الكود بنجاح!")
      setShowAddModal(false)
      resetForm()
      fetchDiscounts()
    } catch (error: any) {
      showAlert("error", error.message || "حدث خطأ في إنشاء الكود")
    } finally {
      setSaving(false)
    }
  }

  const handleEditDiscount = async () => {
    if (!formData.code || !formData.discount || !formData.expiryDate || !selectedDiscount) {
      showAlert("error", "يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/discounts/${selectedDiscount._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          discount: Number.parseInt(formData.discount),
          type: formData.type,
          expiryDate: formData.expiryDate,
          maxUsage: Number.parseInt(formData.maxUsage),
          description: formData.description,
          minOrder: Number.parseInt(formData.minOrder),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showAlert("success", "تم تحديث الكود بنجاح!")
      setShowEditModal(false)
      setSelectedDiscount(null)
      resetForm()
      fetchDiscounts()
    } catch (error: any) {
      showAlert("error", error.message || "حدث خطأ في تحديث الكود")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return

    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showAlert("success", "تم حذف الكود بنجاح!")
      fetchDiscounts()
    } catch (error: any) {
      showAlert("error", error.message || "حدث خطأ في حذف الكود")
    }
  }

  const toggleStatus = async (discount: Discount) => {
    const newStatus = discount.status === "نشط" ? "غير نشط" : "نشط"
    try {
      const res = await fetch(`/api/admin/discounts/${discount._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      fetchDiscounts()
    } catch {
      showAlert("error", "حدث خطأ في تغيير الحالة")
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      type: "%",
      expiryDate: "",
      maxUsage: "",
      description: "",
      minOrder: "",
    })
  }

  const openEditModal = (discount: Discount) => {
    setSelectedDiscount(discount)
    setFormData({
      code: discount.code,
      discount: discount.discount.toString(),
      type: discount.type,
      expiryDate: discount.expiryDate.split("T")[0],
      maxUsage: discount.maxUsage.toString(),
      description: discount.description,
      minOrder: discount.minOrder?.toString() || "0",
    })
    setShowEditModal(true)
  }

  const openDetailsModal = (discount: Discount) => {
    setSelectedDiscount(discount)
    setShowDetailsModal(true)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showAlert("success", "تم نسخ الكود!")
  }

 const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}


  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert */}
      {alert && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الخصومات والعروض</h1>
          <p className="text-gray-600 mt-1">إجمالي الأكواد: {discounts.length}</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إنشاء كود جديد
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <input
            placeholder="ابحث عن كود الخصم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card className="bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">الكود</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">قيمة الخصم</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">تاريخ الانتهاء</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">الاستخدام</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">النسبة</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">الحالة</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      لا توجد أكواد خصم
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{discount.code}</span>
                          <button onClick={() => copyCode(discount.code)} className="p-1 hover:bg-gray-200 rounded">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-800 font-medium">
                        {discount.discount} {discount.type}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{formatDate(discount.expiryDate)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${(discount.usageCount / discount.maxUsage) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {discount.usageCount}/{discount.maxUsage}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-medium text-gray-600">
                          {((discount.usageCount / discount.maxUsage) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(discount)}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            discount.status === "نشط"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : discount.status === "منتهي"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          disabled={discount.status === "منتهي"}
                        >
                          {discount.status}
                        </button>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button
                          onClick={() => openDetailsModal(discount)}
                          className="p-2 hover:bg-cyan-100 text-cyan-600 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(discount)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">إنشاء كود خصم جديد</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكود</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="مثال: WELCOME50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="%">نسبة %</option>
                      <option value="ج.م">جنية مصري ج.م</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف الخصم"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد الاستخدامات</label>
                    <input
                      type="number"
                      value={formData.maxUsage}
                      onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للطلب</label>
                    <input
                      type="number"
                      value={formData.minOrder}
                      onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddDiscount}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">تعديل كود الخصم</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكود</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="%">نسبة %</option>
                      <option value="ج.م">جنية مصري ج.م</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد الاستخدامات</label>
                    <input
                      type="number"
                      value={formData.maxUsage}
                      onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للطلب</label>
                    <input
                      type="number"
                      value={formData.minOrder}
                      onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDiscount(null)
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                  disabled={saving}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleEditDiscount}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحديث"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">تفاصيل كود الخصم</h2>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">الكود:</span>
                  <span className="font-mono font-bold text-blue-600">{selectedDiscount.code}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">قيمة الخصم:</span>
                  <span className="font-bold">
                    {selectedDiscount.discount} {selectedDiscount.type}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">الوصف:</span>
                  <span>{selectedDiscount.description || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">تاريخ الانتهاء:</span>
                  <span>{formatDate(selectedDiscount.expiryDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">الاستخدامات:</span>
                  <span>
                    {selectedDiscount.usageCount} / {selectedDiscount.maxUsage}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">الحد الأدنى للطلب:</span>
                  <span>{selectedDiscount.minOrder}ج.م </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">الحالة:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedDiscount.status === "نشط"
                        ? "bg-green-100 text-green-800"
                        : selectedDiscount.status === "منتهي"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedDiscount.status}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedDiscount(null)
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                إغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
