"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Check, X, Eye, AlertCircle } from "lucide-react"
import type { IWalletRecharge } from "@/models/WalletRecharge"
import type { IWalletTransaction } from "@/models/WalletTransaction"
import { formatCurrency, getStatusBadgeColor, getStatusText, formatDate } from "@/lib/wallet-helpers"

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [recharges, setRecharges] = useState<IWalletRecharge[]>([])
  const [transactions, setTransactions] = useState<IWalletTransaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [selectedRecharge, setSelectedRecharge] = useState<IWalletRecharge | null>(null)

  const [formData, setFormData] = useState({
    fromPhoneNumber: "",
    amount: "",
    screenshot: null as File | null,
  })

  const fetchData = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [balanceRes, rechargesRes, transactionsRes] = await Promise.all([
        fetch(`/api/wallet/balance`).then((res) => res.json()),
        fetch(`/api/wallet/recharge?userId=${userId}`).then((res) => res.json()),
        fetch(`/api/wallet/transactions?userId=${userId}`).then((res) => res.json()),
      ])

      setWalletBalance(balanceRes.balance || 0)
      setRecharges(rechargesRes.recharges || [])
      setTransactions(transactionsRes.transactions || [])
    } catch (err) {
      console.error("Error fetching wallet data:", err)
      setError("حدث خطأ في تحميل بيانات المحفظة")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    // Wait for session to load before doing anything
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Only fetch if we have a valid session with user id
    if (status === "authenticated" && session?.user?.id) {
      fetchData()
    } else if (status === "authenticated" && !session?.user?.id) {
      // Session exists but no user id - something is wrong
      setError("لم يتم العثور على معرف المستخدم")
      setLoading(false)
    }
  }, [status, session?.user?.id, router, fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.fromPhoneNumber || !formData.amount || !formData.screenshot) {
      alert("جميع الحقول مطلوبة")
      return
    }

    try {
      setFormLoading(true)

      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(formData.screenshot)
      reader.onload = async () => {
        const userId = session?.user?.id

        // Use native fetch instead of apiFetch
        const response = await fetch("/api/wallet/recharge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            paymentMethod: "vodafone_cash",
            fromPhoneNumber: formData.fromPhoneNumber,
            amount: Number.parseFloat(formData.amount),
            screenshot: reader.result,
          }),
        })

        const data = await response.json()

        if (data.recharge) {
          setRecharges([data.recharge, ...recharges])
          setFormData({ fromPhoneNumber: "", amount: "", screenshot: null })
          setShowForm(false)
          alert("تم إنشاء الطلب بنجاح. سيتم مراجعته من قبل الإدارة")
        }
        setFormLoading(false)
      }
    } catch (error) {
      console.error("Error creating recharge:", error)
      alert("حدث خطأ في إنشاء الطلب")
      setFormLoading(false)
    }
  }

  // Show loading only when session is loading or data is being fetched
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchData()}>إعادة المحاولة</Button>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  // Show loading spinner while fetching data (after session is confirmed)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0">
          <CardContent className="pt-6">
            <div className="text-white">
              <p className="text-sm opacity-90 mb-2">رصيد المحفظة الحالي</p>
              <h1 className="text-4xl font-bold mb-4">EG {walletBalance.toFixed(2)}</h1>
              <Button onClick={() => setShowForm(!showForm)} className="bg-white text-emerald-600 hover:bg-gray-100">
                <Plus className="w-4 h-4 ml-2" />
                شحن المحفظة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recharge Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>طلب شحن محفظة جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم هاتف Vodafone</label>
                  <input
                    type="tel"
                    value={formData.fromPhoneNumber}
                    onChange={(e) => setFormData({ ...formData, fromPhoneNumber: e.target.value })}
                    placeholder="201234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ (جنيه مصري)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">صورة الإيصال</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700">
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      "إرسال الطلب"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recharge Requests */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات الشحن</CardTitle>
          </CardHeader>
          <CardContent>
            {recharges.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات شحن حتى الآن</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-right py-3 px-4 font-medium">المبلغ</th>
                      <th className="text-right py-3 px-4 font-medium">رقم الهاتف</th>
                      <th className="text-right py-3 px-4 font-medium">الحالة</th>
                      <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                      <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recharges.map((recharge) => (
                      <tr key={recharge._id as unknown as string} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{formatCurrency(recharge.amount)}</td>
                        <td className="py-3 px-4">{recharge.fromPhoneNumber}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(recharge.status)}`}
                          >
                            {getStatusText(recharge.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{formatDate(recharge.createdAt!)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedRecharge(recharge)}
                            className="text-blue-600 hover:underline"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد معاملات حتى الآن</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id as unknown as string}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "credit" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {transaction.type === "credit" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.createdAt!)}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recharge Detail Modal */}
      {selectedRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">المبلغ</p>
                <p className="font-bold text-lg">{formatCurrency(selectedRecharge.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم الهاتف</p>
                <p className="font-medium">{selectedRecharge.fromPhoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الحالة</p>
                <p className={`font-medium px-3 py-1 rounded w-fit ${getStatusBadgeColor(selectedRecharge.status)}`}>
                  {getStatusText(selectedRecharge.status)}
                </p>
              </div>
              {selectedRecharge.adminNote && (
                <div>
                  <p className="text-sm text-gray-500">ملاحظة الإدارة</p>
                  <p className="text-red-600">{selectedRecharge.adminNote}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">صورة الإيصال</p>
                <img
                  src={selectedRecharge.screenshot || "/placeholder.svg"}
                  alt="Receipt"
                  className="max-h-64 rounded-lg"
                />
              </div>
              <Button onClick={() => setSelectedRecharge(null)} className="w-full">
                إغلاق
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
