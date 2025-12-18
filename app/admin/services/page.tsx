"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FlaskConical,
  Phone,
  Calendar,
  FileText,
  Navigation,
  Upload,
  User,
  AlertCircle,
  MapPin,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TrackingTimeline } from "@/components/tracking"

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

// Home test tracking statuses
const HOME_TEST_STATUSES = [
  { key: "order_created", label: "تم إنشاء الطلب" },
  { key: "payment_confirmed", label: "تم تأكيد الدفع" },
  { key: "technician_assigned", label: "تم تعيين الفني" },
  { key: "technician_on_way", label: "الفني في الطريق" },
  { key: "sample_collected", label: "تم جمع العينة" },
  { key: "sample_in_analysis", label: "العينة قيد التحليل" },
  { key: "results_ready", label: "النتائج جاهزة" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغى" },
]

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

export default function TestRequestsPage() {
  const [requests, setRequests] = useState<TestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("الكل")
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Tracking states
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [selectedTrackingStatus, setSelectedTrackingStatus] = useState("")
  const [trackingNote, setTrackingNote] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [assignedToPhone, setAssignedToPhone] = useState("")
  const [resultsFileUrl, setResultsFileUrl] = useState("")
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (appliedSearch) params.set("search", appliedSearch)
      if (statusFilter && statusFilter !== "الكل") params.set("status", statusFilter)

      const response = await fetch(`/api/admin/services/test-requests?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setRequests(data.data || [])
      } else {
        showAlert("error", data.error || "فشل في جلب البيانات")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }, [appliedSearch, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleSearch = () => {
    setAppliedSearch(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Fetch tracking data
  const fetchTracking = async (request: TestRequest) => {
    setTrackingLoading(true)
    try {
      // Try to get existing tracking or create new one
      let response = await fetch(`/api/tracking?referenceType=home_test&referenceId=${request._id}`)
      let data = await response.json()

      if (!data.success) {
        // Create new tracking
        response = await fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceType: "home_test",
            referenceId: request._id,
            initialStatus: "order_created",
            note: "تم إنشاء طلب التحليل المنزلي",
          }),
        })
        data = await response.json()

        if (data.success) {
          // Fetch the full tracking data
          response = await fetch(`/api/tracking?referenceType=home_test&referenceId=${request._id}`)
          data = await response.json()
        }
      }

      if (data.success) {
        setTrackingData(data.data)
        setSelectedTrackingStatus(data.data.currentStatus)
        setAssignedTo(data.data.assignedTo || "")
        setAssignedToPhone(data.data.assignedToPhone || "")
        setResultsFileUrl(data.data.resultsFileUrl || "")
      }
    } catch (error) {
      console.error("Error fetching tracking:", error)
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleOpenTracking = async (request: TestRequest) => {
    setSelectedRequest(request)
    setShowTrackingDialog(true)
    await fetchTracking(request)
  }

  const handleUpdateTracking = async () => {
    if (!trackingData || !selectedTrackingStatus) return

    setIsUpdatingTracking(true)
    try {
      const response = await fetch(`/api/admin/tracking/${trackingData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedTrackingStatus,
          note: trackingNote,
          changedBy: "admin",
          assignedTo: assignedTo || undefined,
          assignedToPhone: assignedToPhone || undefined,
          resultsFileUrl: resultsFileUrl || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم ��حديث حالة التتبع بنجاح")
        setTrackingNote("")
        // Refresh tracking data
        if (selectedRequest) await fetchTracking(selectedRequest)
        // Refresh requests
        fetchRequests()
      } else {
        showAlert("error", data.error || "فشل في تحديث الحالة")
      }
    } catch (error) {
      showAlert("error", "حدث خطأ أثناء تحديث الحالة")
    } finally {
      setIsUpdatingTracking(false)
    }
  }

  const handleUploadResults = async () => {
    if (!trackingData || !resultsFileUrl) return

    setIsUpdatingTracking(true)
    try {
      const response = await fetch("/api/admin/tracking/upload-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingData._id,
          resultsFileUrl,
          note: "تم رفع نتائج التحليل",
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم رفع النتائج بنجاح")
        if (selectedRequest) await fetchTracking(selectedRequest)
        fetchRequests()
      } else {
        showAlert("error", data.error || "فشل في رفع النتائج")
      }
    } catch (error) {
      showAlert("error", "حدث خطأ أثناء رفع النتائج")
    } finally {
      setIsUpdatingTracking(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/services/test-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "تم تحديث الحالة بنجاح")
        fetchRequests()
        setIsDialogOpen(false)
      } else {
        showAlert("error", data.error || "فشل في تحديث الحالة")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      showAlert("error", "فشل في الاتصال بالخادم")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جاري":
        return "bg-yellow-100 text-yellow-700"
      case "مكتمل":
        return "bg-green-100 text-green-700"
      case "ملغى":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "جاري":
        return <Clock className="w-4 h-4" />
      case "مكتمل":
        return <CheckCircle className="w-4 h-4" />
      case "ملغى":
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const RequestsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-20 mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">طلبات التحاليل المنزلية</h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة طلبات التحاليل ({requests.length} طلب)</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="البحث باسم المريض أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
          <Search className="w-4 h-4 ml-2" />
          بحث
        </Button>
        <div className="flex gap-2">
          {["الكل", "جاري", "مكتمل", "ملغى"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {isLoading ? (
        <RequestsSkeleton />
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">لا توجد طلبات حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{request.patientName}</CardTitle>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}
                  >
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span dir="ltr">{request.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{request.date}</span>
                  {request.time && <span className="text-gray-500">- {request.time}</span>}
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mt-1" />
                  <span className="text-gray-700">
                    {request.tests.slice(0, 2).join("، ")}
                    {request.tests.length > 2 ? ` +${request.tests.length - 2}` : ""}
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">{request.totalPrice} ج.م</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      تفاصيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                      onClick={() => handleOpenTracking(request)}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      تتبع
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{selectedRequest.patientName}</h3>
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedRequest.status)}`}
                >
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">الهاتف:</span>
                  <p dir="ltr" className="font-medium">
                    {selectedRequest.phone}
                  </p>
                </div>
                {selectedRequest.whatsapp && (
                  <div>
                    <span className="text-gray-500">واتساب:</span>
                    <p dir="ltr" className="font-medium">
                      {selectedRequest.whatsapp}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">التاريخ:</span>
                  <p className="font-medium">{selectedRequest.date}</p>
                </div>
                <div>
                  <span className="text-gray-500">الوقت:</span>
                  <p className="font-medium">{selectedRequest.time || "غير محدد"}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-sm">العنوان:</span>
                <p className="font-medium">{selectedRequest.address}</p>
              </div>

              <div>
                <span className="text-gray-500 text-sm">التحاليل المطلوبة:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.tests.map((test, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {test}
                    </span>
                  ))}
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 text-sm">ملاحظات:</span>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="text-2xl font-bold text-emerald-600">{selectedRequest.totalPrice} ج.م</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedRequest?.status === "جاري" && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  onClick={() => handleUpdateStatus(selectedRequest._id, "ملغى")}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                  إلغاء الطلب
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleUpdateStatus(selectedRequest._id, "مكتمل")}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  إتمام الطلب
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-600" />
              تتبع طلب التحليل - {selectedRequest?.patientName}
            </DialogTitle>
          </DialogHeader>

          {trackingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : trackingData ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest?.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span dir="ltr">{selectedRequest?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest?.address}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">مسار الطلب</h4>
                <TrackingTimeline
                  currentStatus={trackingData.currentStatus}
                  statusHistory={trackingData.statusHistory}
                  orderedStatuses={trackingData.orderedStatuses || ORDERED_STATUSES}
                  referenceType="home_test"
                  variant="vertical"
                  showDetails={true}
                />
              </div>

              {/* Results file info */}
              {trackingData.resultsFileUrl && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">تم رفع النتائج</span>
                    <a
                      href={trackingData.resultsFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      عرض الملف
                    </a>
                  </p>
                </div>
              )}

              {/* Update Status */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">تحديث الحالة</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الحالة الجديدة</Label>
                    <Select value={selectedTrackingStatus} onValueChange={setSelectedTrackingStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOME_TEST_STATUSES.map((status) => (
                          <SelectItem key={status.key} value={status.key}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الفني المسؤول (اختياري)</Label>
                    <Input placeholder="اسم الفني" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم هاتف الفني (اختياري)</Label>
                    <Input
                      placeholder="رقم الهاتف"
                      value={assignedToPhone}
                      onChange={(e) => setAssignedToPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رابط ملف النتائج (اختياري)</Label>
                    <Input
                      placeholder="رابط PDF أو صورة النتائج"
                      value={resultsFileUrl}
                      onChange={(e) => setResultsFileUrl(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ملاحظة (اختياري)</Label>
                  <Textarea
                    placeholder="أضف ملاحظة للعميل..."
                    value={trackingNote}
                    onChange={(e) => setTrackingNote(e.target.value)}
                  />
                </div>

                {/* Upload results button */}
                {resultsFileUrl && !trackingData.resultsFileUrl && (
                  <Button
                    variant="outline"
                    className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                    onClick={handleUploadResults}
                    disabled={isUpdatingTracking}
                  >
                    {isUpdatingTracking ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    <Upload className="w-4 h-4 ml-2" />
                    رفع النتائج وتحديث الحالة
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات تتبع</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>
              إغلاق
            </Button>
            <Button
              onClick={handleUpdateTracking}
              disabled={isUpdatingTracking || !trackingData}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdatingTracking ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تحديث الحالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
