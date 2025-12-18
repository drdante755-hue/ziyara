"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrackingTimeline } from "@/components/tracking"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  User,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlaskConical,
  MessageCircle,
  FileText,
  Banknote,
  Download,
  ExternalLink,
  RefreshCw,
} from "lucide-react"

interface TestRequest {
  _id: string
  patientName: string
  phone: string
  whatsapp?: string
  address: string
  tests: string[]
  totalPrice: number
  date: string
  time: string
  notes?: string
  team?: string
  status: "جاري" | "مكتمل" | "ملغى"
  trackingId?: string
  resultsFileUrl?: string
  createdAt: string
  updatedAt?: string
}

interface TrackingData {
  _id: string
  trackingNumber: string
  currentStatus: string
  statusHistory: any[]
  orderedStatuses: string[]
  currentStatusInfo: any
  assignedTo?: string
  assignedToPhone?: string
  resultsFileUrl?: string
}

const ORDERED_STATUSES = [
  "order_created",
  "payment_confirmed",
  "technician_assigned",
  "technician_on_way",
  "sample_collected",
  "sample_in_analysis",
  "results_ready",
  "completed",
]

export default function LabRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [request, setRequest] = useState<TestRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    notes: "",
  })

  // Tracking states
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/requests/lab-test/${id}`)
        const data = await response.json()

        if (data.success) {
          setRequest(data.data)
          setEditForm({
            date: data.data.date,
            time: data.data.time,
            notes: data.data.notes || "",
          })
          // Fetch tracking data
          fetchTracking(data.data._id)
        } else {
          setError(data.error || "فشل في جلب بيانات الطلب")
        }
      } catch (err) {
        console.error("Error fetching request:", err)
        setError("فشل في الاتصال بالخادم")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [id])

  const fetchTracking = async (requestId: string) => {
    setTrackingLoading(true)
    try {
      const response = await fetch(`/api/tracking?referenceType=home_test&referenceId=${requestId}`)
      const data = await response.json()

      if (data.success) {
        setTrackingData(data.data)
      }
    } catch (error) {
      console.error("Error fetching tracking:", error)
    } finally {
      setTrackingLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جاري":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "مكتمل":
        return "bg-green-100 text-green-800 border-green-300"
      case "ملغى":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "جاري":
        return <Clock className="w-5 h-5" />
      case "مكتمل":
        return <CheckCircle className="w-5 h-5" />
      case "ملغى":
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const confirmEdit = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/requests/lab-test/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        setRequest({ ...request!, ...editForm })
        setShowEditModal(false)
      } else {
        alert(data.error || "فشل في تحديث الطلب")
      }
    } catch (err) {
      console.error("Error updating request:", err)
      alert("فشل في الاتصال بالخادم")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/requests/lab-test/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        router.push("/user/lab-requests")
      } else {
        alert(data.error || "فشل في إلغاء الطلب")
      }
    } catch (err) {
      console.error("Error cancelling request:", err)
      alert("فشل في الاتصال بالخادم")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error || "الطلب غير موجود"}</p>
          <Button onClick={() => router.push("/user/lab-requests")}>العودة للطلبات</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">تفاصيل طلب التحليل</h1>
            <p className="text-gray-600 mt-1">
              رقم الطلب: #{request._id.slice(-8)}
              {trackingData && <span className="mr-2 text-emerald-600 font-mono">({trackingData.trackingNumber})</span>}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/user/lab-requests")}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>

        {/* Status Card */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    request.status === "جاري"
                      ? "bg-yellow-100"
                      : request.status === "مكتمل"
                        ? "bg-green-100"
                        : "bg-red-100"
                  }`}
                >
                  {getStatusIcon(request.status)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">حالة الطلب</h2>
                  <Badge className={`${getStatusColor(request.status)} text-sm mt-1`}>{request.status}</Badge>
                </div>
              </div>
              {request.status === "جاري" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline Card */}
        {trackingData && (
          <Card className="mb-6 shadow-lg border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  تتبع الطلب
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => request && fetchTracking(request._id)}
                  disabled={trackingLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${trackingLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Assigned Technician */}
              {trackingData.assignedTo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">الفني المسؤول</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <User className="w-4 h-4" />
                      <span>{trackingData.assignedTo}</span>
                    </div>
                    {trackingData.assignedToPhone && (
                      <div className="flex items-center gap-2 text-blue-700">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{trackingData.assignedToPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Results Download */}
              {(trackingData.resultsFileUrl || request.resultsFileUrl) && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                  <h4 className="font-medium text-emerald-900 mb-2">نتائج التحليل</h4>
                  <Button
                    variant="outline"
                    className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    onClick={() => window.open(trackingData.resultsFileUrl || request.resultsFileUrl, "_blank")}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل النتائج
                    <ExternalLink className="w-3 h-3 mr-2" />
                  </Button>
                </div>
              )}

              {/* Timeline */}
              <TrackingTimeline
                currentStatus={trackingData.currentStatus}
                statusHistory={trackingData.statusHistory}
                orderedStatuses={trackingData.orderedStatuses || ORDERED_STATUSES}
                referenceType="home_test"
                variant="vertical"
                showDetails={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Price Card */}
        <Card className="mb-6 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Banknote className="w-8 h-8" />
                <div>
                  <p className="text-emerald-100 text-sm">الإجمالي المطلوب</p>
                  <p className="text-3xl font-bold">{request.totalPrice} ج.م</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm">عدد التحاليل</p>
                <p className="text-2xl font-bold">{request.tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-emerald-600" />
              بيانات المريض
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">اسم المريض</p>
                  <p className="font-medium text-gray-900">{request.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-medium text-gray-900" dir="ltr">
                    {request.phone}
                  </p>
                </div>
              </div>
              {request.whatsapp && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">واتساب</p>
                    <p className="font-medium text-gray-900" dir="ltr">
                      {request.whatsapp}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:col-span-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">العنوان</p>
                  <p className="font-medium text-gray-900">{request.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests Info */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              التحاليل المطلوبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {request.tests.map((test, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{test}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">تاريخ الزيارة</p>
                  <p className="font-semibold text-gray-900">{request.date}</p>
                </div>
              </div>
              {request.time && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">وقت الزيارة</p>
                    <p className="font-semibold text-gray-900">{request.time}</p>
                  </div>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">ملاحظات</p>
                </div>
                <p className="text-gray-600">{request.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل موعد التحليل</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">تاريخ الزيارة</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">وقت الزيارة</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">ملاحظات</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  placeholder="أضف ملاحظات إضافية..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmEdit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">تأكيد إلغاء الطلب</h3>
            <p className="text-sm text-gray-600 mb-6">
              هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                تراجع
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
