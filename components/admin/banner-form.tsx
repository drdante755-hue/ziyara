"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Image from "next/image"
import { Search, X, Loader2, Zap } from "lucide-react"

const bannerFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().optional(),
  actionType: z.enum(["discount", "category", "product", "url"]),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  productSelectionMode: z.enum(["manual", "auto"]).optional(),
  autoDiscountThreshold: z.coerce.number().min(0).max(100).optional(),
  // </CHANGE>
  targetCategoryId: z.string().optional(),
  targetProductId: z.string().optional(),
  targetUrl: z.string().url().optional(),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
})

type BannerFormData = z.infer<typeof bannerFormSchema>

interface BannerFormProps {
  banner?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

interface UploadedImage {
  imageUrl: string
  imagePublicId: string
  imageMimeType: string
  imageWidth: number
  imageHeight: number
}

interface ProductItem {
  _id: string
  name: string
  nameAr?: string
  price: number
  discount?: number
  images?: string[]
  imageUrl?: string
  category: string
}

export function BannerForm({ banner, onSubmit, isLoading = false }: BannerFormProps) {
  const [imagePreview, setImagePreview] = useState<string>(banner?.imageUrl || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    banner?.imageUrl
      ? {
          imageUrl: banner.imageUrl,
          imagePublicId: banner.imagePublicId,
          imageMimeType: banner.imageMimeType || "image/jpeg",
          imageWidth: banner.imageWidth || 1920,
          imageHeight: banner.imageHeight || 480,
        }
      : null,
  )

  const [linkedProducts, setLinkedProducts] = useState<ProductItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isFetchingAutoProducts, setIsFetchingAutoProducts] = useState(false)
  // </CHANGE>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: banner || {
      actionType: "discount",
      isActive: false,
      discountType: "percentage",
      productSelectionMode: "manual",
      autoDiscountThreshold: 10,
    },
  })

  const actionType = watch("actionType")
  const productSelectionMode = watch("productSelectionMode")
  const autoDiscountThreshold = watch("autoDiscountThreshold")
  // </CHANGE>

  // Fetch categories and products
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([fetch("/api/categories/public"), fetch("/api/products?limit=100")])

        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData.data || [])
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json()
          setProducts(prodData.products || [])
        }
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    const fetchLinkedProducts = async () => {
      if (!banner?._id || actionType !== "discount") return

      setIsLoadingProducts(true)
      try {
        const response = await fetch(`/api/discounts/${banner._id}/products`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.products) {
            const mapped = data.products.map((p: any) => ({
              _id: p.id,
              name: p.name,
              nameAr: p.nameAr,
              price: p.originalPrice || p.price,
              discount: p.discount,
              images: [p.image],
              category: p.category,
            }))
            setLinkedProducts(mapped)
          }
        }
      } catch (error) {
        console.error("Error fetching linked products:", error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchLinkedProducts()
  }, [banner?._id, actionType])

  useEffect(() => {
    const linkedIds = linkedProducts.map((p) => p._id)
    const filtered = products.filter((p: any) => !linkedIds.includes(p.id))
    setAvailableProducts(
      filtered.map((p: any) => ({
        _id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        price: p.price,
        discount: p.discount,
        images: [p.image],
        category: p.category,
      })),
    )
  }, [products, linkedProducts])

  const fetchAutoDiscountProducts = async () => {
    if (!autoDiscountThreshold || autoDiscountThreshold <= 0) {
      toast.error("يرجى تحديد الحد الأدنى لنسبة الخصم")
      return
    }

    setIsFetchingAutoProducts(true)
    try {
      const response = await fetch(`/api/products/by-discount?minDiscount=${autoDiscountThreshold}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.products) {
          const mapped = data.products.map((p: any) => ({
            _id: p.id || p._id,
            name: p.name,
            nameAr: p.nameAr,
            price: p.price,
            discount: p.discount,
            images: p.images || [p.image],
            category: p.category,
          }))
          setLinkedProducts(mapped)
          toast.success(`تم جلب ${mapped.length} منتج بخصم ${autoDiscountThreshold}% أو أكثر`)
        } else {
          toast.info("لا توجد منتجات بهذه النسبة من الخصم")
          setLinkedProducts([])
        }
      } else {
        toast.error("فشل في جلب المنتجات")
      }
    } catch (error) {
      console.error("Error fetching auto discount products:", error)
      toast.error("حدث خطأ أثناء جلب المنتجات")
    } finally {
      setIsFetchingAutoProducts(false)
    }
  }
  // </CHANGE>

  const filteredAvailableProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.nameAr?.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  const handleAddProduct = (product: ProductItem) => {
    setLinkedProducts((prev) => [...prev, product])
    setProductSearchQuery("")
  }

  const handleRemoveProduct = (productId: string) => {
    setLinkedProducts((prev) => prev.filter((p) => p._id !== productId))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImageToCloudinary = async (file: File): Promise<UploadedImage> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        try {
          const errorData = JSON.parse(text)
          throw new Error(errorData.error || "فشل في رفع الصورة")
        } catch {
          throw new Error(`فشل الرفع: ${response.status}`)
        }
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "فشل الرفع")
      }

      return {
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        imageMimeType: data.imageMimeType,
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight,
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "فشل في رفع الصورة"
      toast.error(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormSubmit = async (data: BannerFormData) => {
    try {
      let imageData = uploadedImage

      if (imageFile) {
        imageData = await uploadImageToCloudinary(imageFile)
        setUploadedImage(imageData)
        setImagePreview(imageData.imageUrl)
      }

      if (!imageData?.imageUrl || !imageData?.imagePublicId) {
        toast.error("يرجى رفع صورة للبنر")
        return
      }

      const submitData = {
        ...data,
        imageUrl: imageData.imageUrl,
        imagePublicId: imageData.imagePublicId,
        imageMimeType: imageData.imageMimeType,
        imageWidth: imageData.imageWidth,
        imageHeight: imageData.imageHeight,
        productSelectionMode: actionType === "discount" ? data.productSelectionMode : undefined,
        autoDiscountThreshold:
          actionType === "discount" && data.productSelectionMode === "auto" ? data.autoDiscountThreshold : undefined,
        linkedProductIds: actionType === "discount" ? linkedProducts.map((p) => p._id) : undefined,
        // </CHANGE>
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>صورة البنر</CardTitle>
          <CardDescription>ارفع صورة بنسبة عرض 4:1</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imagePreview && (
            <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
              <Image src={imagePreview || "/placeholder.svg"} alt="معاينة البنر" fill className="object-cover" />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
            className="form-input"
          />
          <p className="text-sm text-muted-foreground">الحجم المُوصى به: 1920×480 بكسل. الحد الأقصى: 5 ميجابايت</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل البنر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">العنوان</Label>
            <Input id="title" placeholder="عنوان البنر" {...register("title")} className="form-input mt-2" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              placeholder="وصف البنر (اختياري)"
              {...register("description")}
              className="form-input mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إجراء البنر</CardTitle>
          <CardDescription>ماذا يحدث عند النقر على البنر</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="actionType">نوع الإجراء</Label>
            <Select
              defaultValue={banner?.actionType || "discount"}
              onValueChange={(value) => setValue("actionType", value as any)}
            >
              <SelectTrigger id="actionType">
                <SelectValue placeholder="اختر نوع الإجراء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">حملة خصم</SelectItem>
                <SelectItem value="category">توجيه لقسم</SelectItem>
                <SelectItem value="product">توجيه لمنتج</SelectItem>
                <SelectItem value="url">رابط خارجي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType === "discount" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">نوع الخصم</Label>
                  <Select
                    defaultValue={banner?.discountType || "percentage"}
                    onValueChange={(value) => setValue("discountType", value as any)}
                  >
                    <SelectTrigger id="discountType">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">قيمة الخصم</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    placeholder="10"
                    {...register("discountValue")}
                    className="form-input mt-2"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">طريقة اختيار المنتجات</Label>
                <p className="text-sm text-muted-foreground mb-3">اختر كيفية تحديد المنتجات المشمولة بالخصم</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      productSelectionMode === "manual"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setValue("productSelectionMode", "manual")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5" />
                      <span className="font-medium">يدوي</span>
                    </div>
                    <p className="text-xs text-muted-foreground">اختر المنتجات يدوياً من القائمة</p>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      productSelectionMode === "auto"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setValue("productSelectionMode", "auto")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">تلقائي</span>
                    </div>
                    <p className="text-xs text-muted-foreground">جلب المنتجات حسب نسبة الخصم</p>
                  </div>
                </div>

                {/* وضع تلقائي */}
                {productSelectionMode === "auto" && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4 mb-4">
                    <div>
                      <Label htmlFor="autoDiscountThreshold">الحد الأدنى لنسبة الخصم (%)</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        سيتم جلب جميع المنتجات التي لديها خصم بهذه النسبة أو أكثر
                      </p>
                      <div className="flex gap-3">
                        <Input
                          id="autoDiscountThreshold"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="10"
                          {...register("autoDiscountThreshold")}
                          className="form-input flex-1"
                        />
                        <Button
                          type="button"
                          onClick={fetchAutoDiscountProducts}
                          disabled={isFetchingAutoProducts}
                          className="min-w-[140px]"
                        >
                          {isFetchingAutoProducts ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري الجلب...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 ml-2" />
                              جلب المنتجات
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {/* </CHANGE> */}

                {/* وضع يدوي - البحث */}
                {productSelectionMode === "manual" && (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="ابحث عن منتج لإضافته..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>

                    {productSearchQuery && filteredAvailableProducts.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto mb-4 bg-background shadow-lg">
                        {filteredAvailableProducts.slice(0, 10).map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => handleAddProduct(product)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.price} ج.م
                                  {product.discount ? ` • خصم ${product.discount}%` : ""}
                                </p>
                              </div>
                            </div>
                            <Button type="button" size="sm" variant="outline">
                              إضافة
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* قائمة المنتجات المضافة */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">المنتجات المضافة ({linkedProducts.length})</p>

                  {isLoadingProducts ? (
                    <div className="text-center py-4 text-muted-foreground">جاري تحميل المنتجات...</div>
                  ) : linkedProducts.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">
                        {productSelectionMode === "auto"
                          ? "اضغط على 'جلب المنتجات' لجلب المنتجات تلقائياً"
                          : "لم تتم إضافة منتجات بعد. ابحث عن منتج لإضافته للعرض."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {linkedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-2 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium text-xs line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.price} ج.م
                                {product.discount ? ` • ${product.discount}%` : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveProduct(product._id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {actionType === "category" && (
            <div>
              <Label htmlFor="targetCategoryId">اختر القسم</Label>
              <Select
                defaultValue={banner?.targetCategoryId}
                onValueChange={(value) => setValue("targetCategoryId", value)}
              >
                <SelectTrigger id="targetCategoryId">
                  <SelectValue placeholder="اختر قسماً" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.nameAr || cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actionType === "product" && (
            <div>
              <Label htmlFor="targetProductId">اختر المنتج</Label>
              <Select
                defaultValue={banner?.targetProductId}
                onValueChange={(value) => setValue("targetProductId", value)}
              >
                <SelectTrigger id="targetProductId">
                  <SelectValue placeholder="اختر منتجاً" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.nameAr || prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actionType === "url" && (
            <div>
              <Label htmlFor="targetUrl">الرابط</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com"
                {...register("targetUrl")}
                className="form-input mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الجدولة والظهور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <Input id="startDate" type="datetime-local" {...register("startDate")} className="form-input mt-2" />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <Input id="endDate" type="datetime-local" {...register("endDate")} className="form-input mt-2" />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              {...register("isActive")}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              تفعيل البنر فوراً
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? "جاري الحفظ..." : banner ? "تحديث البنر" : "إنشاء البنر"}
        </Button>
      </div>
    </form>
  )
}
