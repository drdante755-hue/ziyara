"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TrackingTimeline } from "./tracking-timeline"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, AlertCircle, Upload, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusInfo {
  key: string
  label: string
  labelEn: string
  icon: string
  color: string
}

interface AdminTrackingManagerProps {
  trackingId: string
  currentStatus: string
  statusHistory: any[]
  orderedStatuses: string[]
  referenceType: "home_test" | "product_order"
  availableStatuses: StatusInfo[]
  assignedTo?: string
  assignedToPhone?: string
  resultsFileUrl?: string
  onUpdate?: () => void
}

export function AdminTrackingManager({
  trackingId,
  currentStatus,
  statusHistory,
  orderedStatuses,
  referenceType,
  availableStatuses,
  assignedTo,
  assignedToPhone,
  resultsFileUrl,
  onUpdate,
}: AdminTrackingManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Form states
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [statusNote, setStatusNote] = useState("")
  const [assignedName, setAssignedName] = useState(assignedTo || "")
  const [assignedPhone, setAssignedPhone] = useState(assignedToPhone || "")
  const [fileUrl, setFileUrl] = useState(resultsFileUrl || "")

  const showAlertMessage = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/tracking/${trackingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: statusNote,
          changedBy: "admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlertMessage("success", "تم تحديث الحالة بنجاح")
        setShowUpdateDialog(false)
        setStatusNote("")
        onUpdate?.()
      } else {
        showAlertMessage("error", data.error || "فشل في تحديث الحالة")
      }
    } catch (error) {
      showAlertMessage("error", "حدث خطأ أثناء تحديث الحالة")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssign = async () => {
    if (!assignedName) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/tracking/${trackingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assignedName,
          assignedToPhone: assignedPhone,
          status: referenceType === "home_test" ? "technician_assigned" : currentStatus,
          note: `تم تعيين ${assignedName}`,
          changedBy: "admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlertMessage("success", "تم التعيين بنجاح")
        setShowAssignDialog(false)
        onUpdate?.()
      } else {
        showAlertMessage("error", data.error || "فشل في التعيين")
      }
    } catch (error) {
      showAlertMessage("error", "حدث خطأ أثناء التعيين")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUploadResults = async () => {
    if (!fileUrl) return

    setIsUpdating(true)
    try {
      const response = await fetch("/api/admin/tracking/upload-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId,
          resultsFileUrl: fileUrl,
          note: "تم رفع نتائج التحليل",
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlertMessage("success", "تم رفع النتائج بنجاح")
        setShowUploadDialog(false)
        onUpdate?.()
      } else {
        showAlertMessage("error", data.error || "فشل في رفع النتائج")
      }
    } catch (error) {
      showAlertMessage("error", "حدث خطأ أثناء رفع النتائج")
    } finally {
      setIsUpdating(false)
    }
  }

  const isHomeTest = referenceType === "home_test"

  // Filter out terminal statuses for progression
  const progressionStatuses = availableStatuses.filter(
    (s) => !["cancelled", "returned", "refunded", "rescheduled"].includes(s.key),
  )

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <div
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2",
            alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white",
          )}
        >
          {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {alert.message}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowUpdateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              تحديث الحالة
            </Button>
            <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
              <User className="w-4 h-4 ml-2" />
              {isHomeTest ? "تعيين فني" : "تعيين مسؤول توصيل"}
            </Button>
            {isHomeTest && (
              <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 ml-2" />
                رفع النتائج
              </Button>
            )}
          </div>

          {/* Current assignment */}
          {assignedTo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">{isHomeTest ? "الفني المعين:" : "مسؤول التوصيل:"}</span> {assignedTo}
                {assignedToPhone && <span className="mr-2">({assignedToPhone})</span>}
              </p>
            </div>
          )}

          {/* Results file */}
          {resultsFileUrl && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">تم رفع النتائج</span>
                <a href={resultsFileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  عرض الملف
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">مسار الطلب</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline
            currentStatus={currentStatus}
            statusHistory={statusHistory}
            orderedStatuses={orderedStatuses}
            referenceType={referenceType}
            variant="vertical"
            showDetails={true}
          />
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الحالة الجديدة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظة (اختياري)</Label>
              <Textarea
                placeholder="أضف ملاحظة..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || !selectedStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isHomeTest ? "تعيين فني" : "تعيين مسؤول توصيل"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input placeholder="أدخل الاسم" value={assignedName} onChange={(e) => setAssignedName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                placeholder="أدخل رقم الهاتف"
                value={assignedPhone}
                onChange={(e) => setAssignedPhone(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isUpdating || !assignedName}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Results Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع نتائج التحليل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>رابط الملف</Label>
              <Input
                placeholder="أدخل رابط ملف النتائج (PDF أو صورة)"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-gray-500">يمكنك رفع الملف أولاً ثم لصق الرابط هنا</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleUploadResults}
              disabled={isUpdating || !fileUrl}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              رفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTrackingManager
