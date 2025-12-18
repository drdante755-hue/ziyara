"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { X, MapPin, Star, Shield, Calendar, Stethoscope, Loader2, RefreshCw, CheckCircle } from "lucide-react"

interface NurseRequestOverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface Nurse {
  _id: string
  name: string
  specialty: string
  experience: string
  phone: string
  available: boolean
  imageUrl?: string
  price?: number
  location?: string
  rating?: number
  reviews?: number
}

export function NurseRequestOverlay({ isOpen, onClose }: NurseRequestOverlayProps) {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [isLoadingNurses, setIsLoadingNurses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedNurse, setSelectedNurse] = useState<string | null>(null)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    whatsapp: "",
    address: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })

  useEffect(() => {
    if (isOpen) {
      fetchNurses()
    }
  }, [isOpen])

  const fetchNurses = async () => {
    try {
      setIsLoadingNurses(true)
      const response = await fetch("/api/admin/services/nurses?available=true")
      const data = await response.json()

      if (data.success) {
        setNurses(data.data)
      }
    } catch (error) {
      console.error("Error fetching nurses:", error)
    } finally {
      setIsLoadingNurses(false)
    }
  }

  if (!isOpen) return null

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    if (type === "success") {
      setTimeout(() => {
        setAlert(null)
        onClose()
      }, 2000)
    } else {
      setTimeout(() => setAlert(null), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedNurse) {
      showAlert("error", "الرجاء اختيار ممرض أولاً")
      return
    }

    if (
      !formData.patientName ||
      !formData.phone ||
      !formData.address ||
      !formData.serviceType ||
      !formData.preferredDate ||
      !formData.preferredTime
    ) {
      showAlert("error", "الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedNurseData = nurses.find((n) => n._id === selectedNurse)

      const response = await fetch("/api/admin/services/nurse-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: formData.patientName,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          address: formData.address,
          service: formData.serviceType,
          date: formData.preferredDate,
          time: formData.preferredTime,
          notes: formData.notes,
          nurse: selectedNurseData?.name || "",
          status: "جاري",
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً")
        setFormData({
          patientName: "",
          phone: "",
          whatsapp: "",
          address: "",
          serviceType: "",
          preferredDate: "",
          preferredTime: "",
          notes: "",
        })
        setSelectedNurse(null)
      } else {
        showAlert("error", data.error || "حدث خطأ أثناء إرسال الطلب")
      }
    } catch (error) {
      console.error("Error submitting nurse request:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsSubmitting(false)
    }
  }

  const NursesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4 mb-4" />
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">طلب ممرض منزلي</h2>
              <p className="text-gray-600 mt-1">احجز خدمة تمريض احترافية في منزلك</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Alert */}
          {alert && (
            <Alert className={alert.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription
                className={`flex items-center gap-2 ${alert.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {alert.type === "success" && <CheckCircle className="w-5 h-5" />}
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Available Nurses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">اختر الممرض المناسب</h3>
              <Button variant="ghost" size="sm" onClick={fetchNurses} disabled={isLoadingNurses}>
                <RefreshCw className={`w-4 h-4 ${isLoadingNurses ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {isLoadingNurses ? (
              <NursesSkeleton />
            ) : nurses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">لا يوجد ممرضين متاحين حالياً</p>
                <p className="text-sm text-gray-400 mt-2">يرجى المحاولة لاحقاً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nurses.map((nurse) => (
                  <Card
                    key={nurse._id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedNurse === nurse._id ? "ring-2 ring-emerald-500 border-emerald-500" : "hover:shadow-lg"
                    } ${!nurse.available ? "opacity-60" : ""}`}
                    onClick={() => nurse.available && setSelectedNurse(nurse._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={nurse.imageUrl || `/placeholder.svg?height=48&width=48&query=nurse avatar ${nurse.name}`}
                          alt={nurse.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{nurse.name}</h4>
                            <Shield className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {nurse.rating || 4.5} ({nurse.reviews || 0})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        {nurse.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{nurse.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          <span>{nurse.experience || "خبرة متميزة"}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {nurse.specialty}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-lg font-bold text-emerald-600">{nurse.price || 150} ج.م/ساعة</div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${nurse.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {nurse.available ? "متاح" : "مشغول"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form */}
          {selectedNurse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  تفاصيل الحجز
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">اسم المريض *</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="أدخل اسم المريض"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">رقم الواتساب (اختياري)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="أدخل العنوان التفصيلي"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceType">نوع الخدمة المطلوبة *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="حقن">حقن</SelectItem>
                        <SelectItem value="قياس ضغط الدم">قياس ضغط الدم</SelectItem>
                        <SelectItem value="قياس السكر">قياس السكر</SelectItem>
                        <SelectItem value="تضميد الجروح">تضميد الجروح</SelectItem>
                        <SelectItem value="رعاية المسنين">رعاية المسنين</SelectItem>
                        <SelectItem value="رعاية الأطفال">رعاية الأطفال</SelectItem>
                        <SelectItem value="علاج طبيعي">علاج طبيعي</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">التاريخ المفضل *</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">الوقت المفضل *</Label>
                      <Input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي ملاحظات أو تعليمات خاصة"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        "تأكيد الحجز"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
