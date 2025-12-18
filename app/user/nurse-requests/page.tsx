"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
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
  Stethoscope,
  Search,
  RefreshCw,
} from "lucide-react"

interface NurseRequest {
  _id: string
  patientName: string
  phone: string
  whatsapp?: string
  address: string
  service: string
  nurseId?: string
  nurseName?: string
  date: string
  time: string
  notes?: string
  status: "جاري" | "مكتمل" | "ملغى"
  createdAt: string
}

export default function NurseRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<NurseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchPhone, setSearchPhone] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<NurseRequest | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    notes: "",
  })

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchPhone) {
        params.set("phone", searchPhone)
      }

      const response = await fetch(`/api/requests/nurse?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setRequests(data.data || [])
      } else {
        setError(data.error || "فشل في جلب الطلبات")
      }
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError("فشل في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }, [searchPhone])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جاري":
        return "bg-yellow-100 text-yellow-800"
      case "مكتمل":
        return "bg-green-100 text-green-800"
      case "ملغى":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const filteredRequests = () => {
    if (activeTab === "all") return requests
    return requests.filter((request) => request.status === activeTab)
  }

  const handleEdit = (request: NurseRequest) => {
    setSelectedRequest(request)
    setEditForm({
      date: request.date,
      time: request.time,
      notes: request.notes || "",
    })
    setShowEditModal(true)
  }

  const handleDelete = (request: NurseRequest) => {
    setSelectedRequest(request)
    setShowDeleteModal(true)
  }

  const confirmEdit = async () => {
    if (!selectedRequest) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/requests/nurse/${selectedRequest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        setRequests(requests.map((req) => (req._id === selectedRequest._id ? { ...req, ...editForm } : req)))
        setShowEditModal(false)
        setSelectedRequest(null)
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
    if (!selectedRequest) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/requests/nurse/${selectedRequest._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setRequests(requests.map((req) => (req._id === selectedRequest._id ? { ...req, status: "ملغى" } : req)))
        setShowDeleteModal(false)
        setSelectedRequest(null)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const RequestsSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">طلبات الممرض</h1>
            <p className="text-gray-600 text-lg mt-2">تابع وإدارة طلبات الممرض المنزلي</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>

        <div className="flex gap-4 items-center mb-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث برقم الهاتف..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="pr-10 bg-white"
              dir="ltr"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchRequests}
            disabled={isLoading}
            className="shrink-0 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full gap-2 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 rounded-lg whitespace-nowrap"
                >
                  جميع الطلبات
                </TabsTrigger>
                <TabsTrigger
                  value="جاري"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 rounded-lg whitespace-nowrap"
                >
                  قيد التنفيذ
                </TabsTrigger>
                <TabsTrigger
                  value="مكتمل"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 rounded-lg whitespace-nowrap"
                >
                  مكتمل
                </TabsTrigger>
                <TabsTrigger
                  value="ملغى"
                  className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 rounded-lg whitespace-nowrap"
                >
                  ملغي
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <RequestsSkeleton />
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <Button onClick={fetchRequests}>إعادة المحاولة</Button>
                  </div>
                ) : filteredRequests().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                    <p className="text-sm text-gray-600 mb-4">لم يتم العثور على طلبات ممرض في هذه الفئة</p>
                    <Button onClick={() => router.push("/user/home")} className="bg-emerald-600 hover:bg-emerald-700">
                      احجز ممرض الآن
                    </Button>
                  </div>
                ) : (
                  filteredRequests().map((request) => (
                    <Card
                      key={request._id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/user/nurse-requests/${request._id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg">{request.patientName}</h3>
                              <Badge className={`${getStatusColor(request.status)} border-0`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(request.status)}
                                  {request.status}
                                </div>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Stethoscope className="w-4 h-4" />
                                  <span>الخدمة: {request.service}</span>
                                </div>
                                {request.nurseName && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span>الممرض: {request.nurseName}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  <span dir="ltr">{request.phone}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{request.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{request.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{request.address}</span>
                                </div>
                              </div>
                            </div>

                            {request.notes && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">{request.notes}</p>
                              </div>
                            )}

                            <div className="text-sm text-gray-500">تاريخ الطلب: {formatDate(request.createdAt)}</div>
                          </div>

                          <div className="flex gap-2">
                            {request.status === "جاري" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(request)}
                                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                >
                                  <Edit className="w-4 h-4 ml-1" />
                                  تعديل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(request)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 ml-1" />
                                  إلغاء
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تعديل الطلب - {selectedRequest.patientName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">تاريخ الزيارة</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">وقت الزيارة</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">ملاحظات</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
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
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">تأكيد الإلغاء</h3>
            <p className="text-sm text-gray-600 mb-4">هل تريد إلغاء طلب الممرض للمريض {selectedRequest.patientName}؟</p>
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
