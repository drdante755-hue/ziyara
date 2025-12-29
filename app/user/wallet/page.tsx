"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Check, X, Eye, AlertCircle, Wallet, CreditCard, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react"
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
    transferNumber: "",
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

    if (!formData.fromPhoneNumber || !formData.amount || !formData.screenshot || !formData.transferNumber) {
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
            transferNumber: formData.transferNumber,
            screenshot: reader.result,
          }),
        })

        const data = await response.json()

        if (data.recharge) {
          setRecharges([data.recharge, ...recharges])
          setFormData({ fromPhoneNumber: "", amount: "", screenshot: null, transferNumber: "" })
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
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* Wallet Balance Card - prominent */}
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-white px-4 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-600 rounded-lg p-3">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">رصيد المحفظة</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold leading-none text-gray-900">{formatCurrency(walletBalance)}</span>
                    <span className="text-sm text-gray-400">رصيد متاح</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2">
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white py-2 px-4 rounded-full shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">شحن المحفظة</span>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => router.push('/user/wallet/transactions')} className="py-2 px-4 rounded-full">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4" />
                    التاريخ
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recharge Form - compact sheet-like */}
        {showForm && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.fromPhoneNumber}
                    onChange={(e) => setFormData({ ...formData, fromPhoneNumber: e.target.value })}
                    placeholder="201234567890"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">المبلغ (جنيه)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">رقم التحويل</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={formData.transferNumber}
                      readOnly
                      placeholder="أضف رقم التحويل"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                    />
                    {!formData.transferNumber && (
                      <Button
                        type="button"
                        onClick={() => {
                          const val = window.prompt("أدخل رقم التحويل:")
                          if (val) setFormData({ ...formData, transferNumber: val })
                        }}
                        className="px-3 py-2"
                      >
                        إدخال
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">صورة الإيصال</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })}
                      className="w-full text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={formLoading} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'إرسال الطلب'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="py-2 px-3">
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Top-up Requests - compact list */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">طلبات الشحن</h3>
          <div className="space-y-2">
            {recharges.length === 0 ? (
              <div className="text-center text-gray-400 py-6">لا توجد طلبات</div>
            ) : (
              recharges.map((r) => (
                <div key={r._id as unknown as string} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${getStatusBadgeColor(r.status).includes('green') ? 'bg-green-50 text-green-600' : getStatusBadgeColor(r.status).includes('red') ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {r.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : r.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(r.amount)}</p>
                      <p className="text-xs text-gray-400">{r.fromPhoneNumber} · {formatDate(r.createdAt!)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getStatusBadgeColor(r.status).includes('green') ? 'text-green-600' : getStatusBadgeColor(r.status).includes('red') ? 'text-red-600' : 'text-yellow-600'}`}>{getStatusText(r.status)}</span>
                    <button onClick={() => setSelectedRecharge(r)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions History - compact cards */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">سجل المعاملات</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-6">لا توجد معاملات</div>
            ) : (
              transactions.map((t) => (
                <div key={t._id as unknown as string} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-md ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {t.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.orderId ? `#${t.orderId} · ` : ''}{formatDate(t.createdAt!)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recharge Detail Modal */}
      {selectedRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full rounded-2xl">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">المبلغ</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedRecharge.amount)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${getStatusBadgeColor(selectedRecharge.status)}`}>{getStatusText(selectedRecharge.status)}</div>
              </div>

              <div>
                <p className="text-xs text-gray-500">رقم الهاتف</p>
                <p className="font-medium">{selectedRecharge.fromPhoneNumber}</p>
              </div>

              {selectedRecharge.adminNote && (
                <div>
                  <p className="text-xs text-gray-500">ملاحظة الإدارة</p>
                  <p className="text-sm text-red-600">{selectedRecharge.adminNote}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">صورة الإيصال</p>
                <img src={selectedRecharge.screenshot || "/placeholder.svg"} alt="Receipt" className="w-full rounded-lg object-contain max-h-64" />
              </div>

              <Button onClick={() => setSelectedRecharge(null)} className="w-full">إغلاق</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
