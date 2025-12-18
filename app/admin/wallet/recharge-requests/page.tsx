"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X, Eye } from "lucide-react"
import type { IWalletRecharge } from "@/models/WalletRecharge"
import { formatCurrency, formatDate } from "@/lib/wallet-helpers"
import { apiFetch } from "@/lib/api"

type PopulatedUser = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type RechargeWithUser = Omit<IWalletRecharge, "userInfo"> & {
  userInfo: PopulatedUser
}

export default function RechargeRequestsPage() {
  const [loading, setLoading] = useState(true)
  const [recharges, setRecharges] = useState<RechargeWithUser[]>([])
  const [selectedRecharge, setSelectedRecharge] = useState<RechargeWithUser | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    fetchRecharges()
  }, [])

  async function fetchRecharges() {
    try {
      setLoading(true)
      const response = await apiFetch("/api/wallet/recharge/admin", { method: "GET" })
      setRecharges(response.recharges || [])
    } catch (error) {
      console.error("Error fetching recharges:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      setProcessingId(id)
      await apiFetch(`/api/wallet/recharge/${id}`, {
        method: "PATCH",
        body: { action: "approve" },
      })

      setRecharges(recharges.map((r) => (r._id === id as any ? { ...r, status: "approved" } : r)))
      setSelectedRecharge(null)
    } catch (error) {
      console.error("Error approving recharge:", error)
      alert("حدث خطأ في الموافقة على الطلب")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: string) {
    if (!rejectNote.trim()) {
      alert("يرجى إدخال سبب الرفض")
      return
    }

    try {
      setProcessingId(id)
      await apiFetch(`/api/wallet/recharge/${id}`, {
        method: "PATCH",
        body: { action: "reject", adminNote: rejectNote },
      })

      setRecharges(recharges.map((r) => (r._id === id as any ? { ...r, status: "rejected", adminNote: rejectNote } : r)))
      setSelectedRecharge(null)
      setRejectNote("")
      setShowRejectForm(false)
    } catch (error) {
      console.error("Error rejecting recharge:", error)
      alert("حدث خطأ في رفض الطلب")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const pendingRecharges = recharges.filter((r) => r.status === "pending")
  const approvedRecharges = recharges.filter((r) => r.status === "approved")
  const rejectedRecharges = recharges.filter((r) => r.status === "rejected")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">طلبات شحن المحفظة</h1>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="bg-yellow-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            الطلبات قيد الانتظار ({pendingRecharges.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingRecharges.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات قيد الانتظار</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4 font-medium">المستخدم</th>
                    <th className="text-right py-3 px-4 font-medium">الهاتف</th>
                    <th className="text-right py-3 px-4 font-medium">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium">من الرقم</th>
                    <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecharges.map((recharge) => (
                    <tr key={recharge._id as any} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {recharge.userInfo.firstName} {recharge.userInfo.lastName}
                      </td>
                      <td className="py-3 px-4">{recharge.userInfo.phone}</td>
                      <td className="py-3 px-4 font-bold">{formatCurrency(recharge.amount)}</td>
                      <td className="py-3 px-4">{recharge.fromPhoneNumber}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(recharge.createdAt!)}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedRecharge(recharge)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(recharge._id as any)}
                          disabled={processingId === recharge._id as any}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecharge(recharge)
                            setShowRejectForm(true)
                          }}
                          disabled={processingId === recharge._id as any}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Requests */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            الطلبات الموافق عليها ({approvedRecharges.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {approvedRecharges.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات موافق عليها</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4 font-medium">المستخدم</th>
                    <th className="text-right py-3 px-4 font-medium">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedRecharges.map((recharge) => (
                    <tr key={recharge._id as any} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        {recharge.userInfo.firstName} {recharge.userInfo.lastName}
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(recharge.amount)}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(recharge.createdAt!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Requests */}
      <Card>
        <CardHeader className="bg-red-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            الطلبات المرفوضة ({rejectedRecharges.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {rejectedRecharges.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات مرفوضة</p>
          ) : (
            <div className="space-y-2">
              {rejectedRecharges.map((recharge) => (
                <div key={recharge._id as any} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="font-medium mb-1">
                    {recharge.userInfo.firstName} {recharge.userInfo.lastName} - {formatCurrency(recharge.amount)}
                  </p>
                  <p className="text-sm text-red-600">السبب: {recharge.adminNote}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(recharge.createdAt!)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRecharge && !showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-medium">
                    {selectedRecharge.userInfo.firstName} {selectedRecharge.userInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium text-sm">{selectedRecharge.userInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الهاتف</p>
                  <p className="font-medium">{selectedRecharge.userInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">المبلغ</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedRecharge.amount)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">من رقم Vodafone</p>
                <p className="font-medium">{selectedRecharge.fromPhoneNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">صورة الإيصال</p>
                <img
                  src={selectedRecharge.screenshot || "/placeholder.svg"}
                  alt="Receipt"
                  className="max-h-64 w-full rounded-lg mt-2 object-cover"
                />
              </div>

              {selectedRecharge.adminNote && (
                <div>
                  <p className="text-sm text-gray-500">ملاحظة الإدارة</p>
                  <p className="text-red-600 bg-red-50 p-2 rounded">{selectedRecharge.adminNote}</p>
                </div>
              )}

              {selectedRecharge.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedRecharge._id as any)}
                    disabled={processingId === selectedRecharge._id as any}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingId === selectedRecharge._id as any ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري...
                      </>
                    ) : (
                      "الموافقة"
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processingId === selectedRecharge._id as any}
                    variant="destructive"
                    className="flex-1"
                  >
                    الرفض
                  </Button>
                </div>
              )}

              <Button onClick={() => setSelectedRecharge(null)} variant="outline" className="w-full">
                إغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Form Modal */}
      {showRejectForm && selectedRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>رفض الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">سبب الرفض</label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="أدخل سبب رفض الطلب..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-24 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleReject(selectedRecharge._id as any)}
                  disabled={processingId === selectedRecharge._id as any}
                  variant="destructive"
                  className="flex-1"
                >
                  {processingId === selectedRecharge._id as any ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري...
                    </>
                  ) : (
                    "تأكيد الرفض"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectNote("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
