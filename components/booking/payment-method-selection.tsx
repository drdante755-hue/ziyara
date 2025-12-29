"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Banknote, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentMethodSelectionProps {
  amount: number
  paymentMethod: "cash" | "wallet"
  walletBalance: number
  onSelectPaymentMethod: (method: "cash" | "wallet") => void
}

export function PaymentMethodSelection({
  amount,
  paymentMethod,
  walletBalance,
  onSelectPaymentMethod,
}: PaymentMethodSelectionProps) {
  const [userWalletBalance, setUserWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWalletBalance()
  }, [])

  const fetchWalletBalance = async () => {
    try {
      setLoading(true)
      // Mock wallet balance - في التطبيق الحقيقي، يتم جلبه من API
      setTimeout(() => {
        setUserWalletBalance(500) // رصيد تجريبي
        setLoading(false)
      }, 300)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      setLoading(false)
    }
  }

  const hasInsufficientBalance = paymentMethod === "wallet" && userWalletBalance < amount

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر طريقة الدفع</h2>
        <p className="text-gray-600">حدد كيف تريد الدفع لهذا الموعد</p>
      </div>

      {/* Payment Methods */}
      <div className="grid gap-4">
        {/* Cash Payment */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            paymentMethod === "cash" && "ring-2 ring-primary bg-primary/5",
          )}
          onClick={() => onSelectPaymentMethod("cash")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                  paymentMethod === "cash" ? "bg-primary text-white" : "bg-emerald-50 text-emerald-600",
                )}
              >
                <Banknote className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">الدفع نقداً في العيادة</h3>
                <p className="text-sm text-gray-600">ادفع عند الوصول للعيادة</p>
              </div>

              {paymentMethod === "cash" && (
                <div className="shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Payment */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            paymentMethod === "wallet" && "ring-2 ring-primary bg-primary/5",
          )}
          onClick={() => onSelectPaymentMethod("wallet")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                  paymentMethod === "wallet" ? "bg-primary text-white" : "bg-teal-50 text-teal-600",
                )}
              >
                <Wallet className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900">المحفظة الإلكترونية</h3>
                  {!loading && (
                    <Badge variant={userWalletBalance >= amount ? "default" : "destructive"} className="text-xs">
                      {userWalletBalance} جنيه
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">استخدم رصيد محفظتك للدفع</p>
              </div>

              {paymentMethod === "wallet" && (
                <div className="shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insufficient Balance Warning */}
      {hasInsufficientBalance && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">رصيد غير كافٍ</p>
                <p className="text-red-600 text-sm mt-1">
                  رصيدك الحالي ({userWalletBalance} جنيه) أقل من المبلغ المطلوب ({amount} جنيه). يرجى اختيار الدفع نقداً
                  أو شحن محفظتك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amount Summary */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">المبلغ الإجمالي</span>
            <span className="text-2xl font-bold text-primary">{amount} جنيه</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
