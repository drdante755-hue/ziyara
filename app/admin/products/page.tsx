"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, Search, X, Loader2, RefreshCw } from "lucide-react"

interface Product {
  _id: string
  name: string
  category: string
  imageUrl?: string
  price: number
  discount: number
  stock: number
  status: string
  paymentMethod: string
  paymentNumber: string
  description: string
}

interface Category {
  _id: string
  name: string
  color: string
  icon: string
  products: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [selectedStatus, setSelectedStatus] = useState("الكل")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    imageUrl: "",
    price: "",
    discount: "",
    stock: "",
    status: "نشط",
    paymentMethod: "Vodafone Cash",
    paymentNumber: "",
    description: "",
  })

  const statuses = ["الكل", "نشط", "غير نشط"]

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories")
      const result = await response.json()

      if (result.success) {
        setCategories(result.categories)
        // تعيين القسم الأول كافتراضي إذا لم يكن هناك قسم محدد
        if (result.categories.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: result.categories[0].name }))
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])

  // جلب المنتجات من الـ API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "الكل") params.append("category", selectedCategory)
      if (selectedStatus !== "الكل") params.append("status", selectedStatus)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/products?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
      } else {
        showAlert(result.error || "حدث خطأ أثناء جلب المنتجات", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedStatus, searchTerm])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchProducts, fetchCategories])

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3000)
  }

  const handleAddProduct = () => {
    setFormData({
      name: "",
      category: categories.length > 0 ? categories[0].name : "",
      imageUrl: "",
      price: "",
      discount: "",
      stock: "",
      status: "نشط",
      paymentMethod: "Vodafone Cash",
      paymentNumber: "",
      description: "",
    })
    setShowAddModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl || "",
      price: product.price.toString(),
      discount: product.discount?.toString() || "0",
      stock: product.stock.toString(),
      status: product.status,
      paymentMethod: product.paymentMethod || "Vodafone Cash",
      paymentNumber: product.paymentNumber || "",
      description: product.description || "",
    })
    setShowEditModal(true)
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      showAlert("الرجاء ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          imageUrl: formData.imageUrl,
          price: Number.parseFloat(formData.price),
          discount: Number.parseFloat(formData.discount) || 0,
          stock: Number.parseInt(formData.stock),
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          paymentNumber: formData.paymentNumber,
          description: formData.description,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم إضافة المنتج بنجاح", "success")
        setShowAddModal(false)
        fetchProducts()
      } else {
        showAlert(result.error || "حدث خطأ أثناء إضافة المنتج", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.stock) {
      showAlert("الرجاء ملء جميع الحقول المطلوبة", "error")
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          imageUrl: formData.imageUrl,
          price: Number.parseFloat(formData.price),
          discount: Number.parseFloat(formData.discount) || 0,
          stock: Number.parseInt(formData.stock),
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          paymentNumber: formData.paymentNumber,
          description: formData.description,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم تحديث المنتج بنجاح", "success")
        setShowEditModal(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        showAlert(result.error || "حدث خطأ أثناء تحديث المنتج", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        showAlert("تم حذف المنتج بنجاح", "success")
        fetchProducts()
      } else {
        showAlert(result.error || "حدث خطأ أثناء حذف المنتج", "error")
      }
    } catch (error) {
      showAlert("حدث خطأ أثناء الاتصال بالخادم", "error")
    }
  }

  // فلترة المنتجات محليا للبحث السريع
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.includes(searchTerm) || product._id.toString().includes(searchTerm)
    return matchesSearch
  })

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Alert */}
      {alert.show && (
        <div
          className={`${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          } border px-4 py-3 rounded-lg flex items-center justify-between`}
        >
          <span>{alert.message}</span>
          <button onClick={() => setAlert({ ...alert, show: false })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">إدارة المنتجات</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-sm"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-emerald-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="الكل">الكل</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-emerald-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="mr-2 text-slate-600">جاري تحميل المنتجات...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">لا توجد منتجات</p>
        </div>
      ) : (
        <>
          {/* Products Grid - Mobile Card View */}
          <div className="block lg:hidden">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="bg-white border border-emerald-100 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-emerald-50 rounded flex items-center justify-center text-emerald-300">
                            ص
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-1">{product.name}</h3>
                          <p className="text-xs text-slate-500">{product.category}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">السعر</p>
                          <p className="font-semibold text-slate-800">{product.price} ج.م</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">المخزون</p>
                          <p className="font-semibold text-slate-800">{product.stock}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">طريقة الدفع</p>
                          <p className="font-semibold text-slate-800 text-xs">{product.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الحالة</p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                              product.status === "نشط" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Products Table - Desktop View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                  <tr className="text-right text-sm font-semibold text-slate-700">
                    <th className="px-4 py-3">المنتج</th>
                    <th className="px-4 py-3">القسم</th>
                    <th className="px-4 py-3">السعر</th>
                    <th className="px-4 py-3">الخصم</th>
                    <th className="px-4 py-3">المخزون</th>
                    <th className="px-4 py-3">طريقة الدفع</th>
                    <th className="px-4 py-3">رقم الدفع</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-emerald-50/30 transition text-sm">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-emerald-50 rounded flex items-center justify-center text-emerald-300">
                              ص
                            </div>
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{product.price} ج.م</td>
                      <td className="px-4 py-3 text-slate-600">{product.discount}%</td>
                      <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                      <td className="px-4 py-3 text-slate-600">{product.paymentMethod}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{product.paymentNumber}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === "نشط" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 bg-white max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">إضافة منتج جديد</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القسم *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.length === 0 ? (
                      <option value="">لا توجد أقسام متاحة</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">يرجى إضافة قسم واحد على الأقل من صفحة الأقسام أولاً</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أدخل وصف المنتج"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (URL)</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">معاينة:</p>
                      <img
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر *</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الخصم %</label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المخزون *</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="نشط">نشط</option>
                      <option value="غير نشط">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Vodafone Cash</option>
                      <option>InstaPay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الدفع</label>
                    <Input
                      value={formData.paymentNumber}
                      onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                      placeholder="أدخل رقم الدفع"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveProduct}
                  disabled={saving || categories.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "إضافة المنتج"
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 bg-white max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">تعديل المنتج</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProduct(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القسم *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.length === 0 ? (
                      <option value="">لا توجد أقسام متاحة</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أدخل وصف المنتج"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (URL)</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">معاينة:</p>
                      <img
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر *</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الخصم %</label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المخزون *</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="نشط">نشط</option>
                      <option value="غير نشط">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Vodafone Cash</option>
                      <option>InstaPay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الدفع</label>
                    <Input
                      value={formData.paymentNumber}
                      onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                      placeholder="أدخل رقم الدفع"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || categories.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
