"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlaskConical,
  Search,
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
  status: "جاري" | "مكتمل" | "ملغى"
  createdAt: string
}

export default function LabRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<TestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchPhone, setSearchPhone] = useState("")

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchPhone) {
        params.set("phone", searchPhone)
      }

      const response = await fetch(`/api/requests/lab-test?${params.toString()}`)
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">طلبات التحليل المنزلي</h1>
            <p className="text-gray-600 text-lg mt-2">تابع وإدارة طلبات التحليل المنزلي</p>
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

        <div className="max-w-md mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث برقم الهاتف..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="pr-10 bg-white"
              dir="ltr"
            />
          </div>
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
                      <FlaskConical className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                    <p className="text-sm text-gray-600 mb-4">لم يتم العثور على طلبات تحليل في هذه الفئة</p>
                    <Button
                      onClick={() => router.push("/user/lab-test")}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      احجز تحليل الآن
                    </Button>
                  </div>
                ) : (
                  filteredRequests().map((request) => (
                    <Card
                      key={request._id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/user/lab-requests/${request._id}`)}
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
                                  <Phone className="w-4 h-4" />
                                  <span dir="ltr">{request.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">{request.address}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{request.date}</span>
                                </div>
                                {request.time && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{request.time}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Tests List */}
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">التحاليل المطلوبة:</h4>
                              <div className="flex flex-wrap gap-2">
                                {request.tests.map((test, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {test}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {request.notes && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">{request.notes}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t">
                              <span className="text-sm text-gray-500">
                                تاريخ الطلب: {formatDate(request.createdAt)}
                              </span>
                              <span className="text-xl font-bold text-emerald-600">{request.totalPrice} ج.م</span>
                            </div>
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
    </div>
  )
}
