"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrackingTimeline } from "./tracking-timeline"
import { Package, FlaskConical, Phone, User, Calendar, Download, RefreshCw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrackingCardProps {
  trackingId?: string
  trackingNumber?: string
  referenceType?: "home_test" | "product_order"
  referenceId?: string
  showRefresh?: boolean
  className?: string
}

interface TrackingData {
  _id: string
  trackingNumber: string
  referenceType: "home_test" | "product_order"
  currentStatus: string
  statusHistory: any[]
  orderedStatuses: string[]
  currentStatusInfo: any
  assignedTo?: string
  assignedToPhone?: string
  resultsFileUrl?: string
  estimatedDelivery?: string
  createdAt: string
}

export function TrackingCard({
  trackingId,
  trackingNumber,
  referenceType,
  referenceId,
  showRefresh = true,
  className,
}: TrackingCardProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTracking = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = ""
      if (trackingId) {
        url = `/api/tracking/${trackingId}`
      } else if (trackingNumber) {
        url = `/api/tracking?trackingNumber=${trackingNumber}`
      } else if (referenceType && referenceId) {
        url = `/api/tracking?referenceType=${referenceType}&referenceId=${referenceId}`
      } else {
        throw new Error("يرجى توفير معرف التتبع أو رقم التتبع")
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setTracking(data.data)
      } else {
        setError(data.error || "فشل في جلب بيانات التتبع")
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracking()
  }, [trackingId, trackingNumber, referenceType, referenceId])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !tracking) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || "لا توجد بيانات تتبع"}</p>
          <Button variant="outline" onClick={fetchTracking}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isHomeTest = tracking.referenceType === "home_test"
  const statusColor = tracking.currentStatusInfo?.color || "gray"

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isHomeTest ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600",
              )}
            >
              {isHomeTest ? <FlaskConical className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle className="text-lg">{isHomeTest ? "تتبع التحليل المنزلي" : "تتبع الطلب"}</CardTitle>
              <p className="text-sm text-gray-500 font-mono">{tracking.trackingNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "border-0",
                statusColor === "green" && "bg-emerald-100 text-emerald-700",
                statusColor === "blue" && "bg-blue-100 text-blue-700",
                statusColor === "orange" && "bg-orange-100 text-orange-700",
                statusColor === "red" && "bg-red-100 text-red-700",
                statusColor === "purple" && "bg-purple-100 text-purple-700",
              )}
            >
              {tracking.currentStatusInfo?.label || tracking.currentStatus}
            </Badge>
            {showRefresh && (
              <Button variant="ghost" size="icon" onClick={fetchTracking}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Assigned info */}
        {tracking.assignedTo && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">{isHomeTest ? "الفني المسؤول" : "مسؤول التوصيل"}</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <User className="w-4 h-4" />
                <span>{tracking.assignedTo}</span>
              </div>
              {tracking.assignedToPhone && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{tracking.assignedToPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results file */}
        {tracking.resultsFileUrl && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
            <h4 className="font-medium text-emerald-900 mb-2">نتائج التحليل</h4>
            <Button
              variant="outline"
              className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              onClick={() => window.open(tracking.resultsFileUrl, "_blank")}
            >
              <Download className="w-4 h-4 ml-2" />
              تحميل النتائج
              <ExternalLink className="w-3 h-3 mr-2" />
            </Button>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-4">حالة الطلب</h4>
          <TrackingTimeline
            currentStatus={tracking.currentStatus}
            statusHistory={tracking.statusHistory}
            orderedStatuses={tracking.orderedStatuses}
            referenceType={tracking.referenceType}
            variant="vertical"
            showDetails={true}
          />
        </div>

        {/* Estimated delivery */}
        {tracking.estimatedDelivery && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>الوصول المتوقع: </span>
              <span className="font-medium">
                {new Date(tracking.estimatedDelivery).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrackingCard
