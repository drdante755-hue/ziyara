"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BannerForm } from "@/components/admin/banner-form"
import { toast } from "sonner"
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch banners
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/banners?includeInactive=true")
      if (!response.ok) throw new Error("Failed to fetch banners")
      const data = await response.json()
      setBanners(data.data || [])
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast.error("فشل في تحميل البنرات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true)

      const url = selectedBanner ? `/api/admin/banners/${selectedBanner._id}` : "/api/admin/banners"

      const method = selectedBanner ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save banner")

      toast.success(selectedBanner ? "تم تحديث البنر بنجاح" : "تم إنشاء البنر بنجاح")
      setIsDialogOpen(false)
      setSelectedBanner(null)
      await fetchBanners()
    } catch (error) {
      console.error("Error saving banner:", error)
      toast.error("فشل في حفظ البنر")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البنر؟")) return

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete banner")

      toast.success("تم حذف البنر بنجاح")
      await fetchBanners()
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast.error("فشل في حذف البنر")
    }
  }

  const handleToggleActive = async (banner: any) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })

      if (!response.ok) throw new Error("Failed to toggle banner")

      toast.success(banner.isActive ? "تم إلغاء تفعيل البنر" : "تم تفعيل البنر")
      await fetchBanners()
    } catch (error) {
      console.error("Error toggling banner:", error)
      toast.error("فشل في تغيير حالة البنر")
    }
  }

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discount: "حملة خصم",
      category: "توجيه لقسم",
      product: "توجيه لمنتج",
      url: "رابط خارجي",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">البنرات</h1>
          <p className="text-muted-foreground mt-2">إدارة البنرات الترويجية للصفحة الرئيسية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedBanner(null)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء بنر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{selectedBanner ? "تعديل البنر" : "إنشاء بنر جديد"}</DialogTitle>
              <DialogDescription>
                {selectedBanner ? "قم بتحديث تفاصيل البنر أدناه" : "املأ النموذج لإنشاء بنر ترويجي جديد"}
              </DialogDescription>
            </DialogHeader>
            <BannerForm banner={selectedBanner} onSubmit={handleSubmit} isLoading={isSubmitting} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">جاري تحميل البنرات...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
          <p className="text-muted-foreground">لم يتم إنشاء أي بنرات بعد</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصورة</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">نوع الإجراء</TableHead>
                <TableHead className="text-right">الفترة الزمنية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="relative w-16 h-10 bg-muted rounded overflow-hidden">
                      <Image
                        src={banner.imageUrl || "/placeholder.svg"}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{banner.title}</p>
                      {banner.description && <p className="text-sm text-muted-foreground">{banner.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{getActionTypeLabel(banner.actionType)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(banner.startDate).toLocaleDateString("ar-EG")} -{" "}
                    {new Date(banner.endDate).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {banner.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(banner)}
                        title={banner.isActive ? "إلغاء التفعيل" : "تفعيل"}
                      >
                        {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedBanner(banner)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>تعديل البنر</DialogTitle>
                            <DialogDescription>قم بتحديث تفاصيل البنر أدناه</DialogDescription>
                          </DialogHeader>
                          <BannerForm banner={selectedBanner} onSubmit={handleSubmit} isLoading={isSubmitting} />
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(banner._id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
