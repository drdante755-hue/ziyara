"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, Mail } from "lucide-react"
import FloatingMedicalIcons from "@/components/floating-medical-icons"
import { apiFetch, getApiBaseUrl } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [value, setValue] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return
    const method = value.includes("@") ? "email" : "phone"
    setIsSending(true)
    try {
      const apiBase = getApiBaseUrl()
      if (apiBase) {
        await apiFetch("/auth/forgot-password/send-code", {
          method: "POST",
          body: method === "email" ? { email: value } : { phone: value },
        })
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      // pass context to verification page
      localStorage.setItem("fp_method", method)
      localStorage.setItem("fp_target", value)
      window.location.href = "/verification-forgetPassword"
    } catch (e) {
      alert("تعذر إرسال رمز الاستعادة، حاول لاحقاً")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Floating Medical Icons */}
      <FloatingMedicalIcons />

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-3 sm:p-4 lg:p-6">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                زيارة
              </h1>
              <p className="text-xs text-emerald-600 font-medium">منصة الرعاية الصحية الذكية</p>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🔑 استعادة كلمة المرور
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
              📧 أدخل بريدك الإلكتروني أو رقم هاتفك وسنرسل لك رابط استعادة كلمة المرور
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-right font-medium text-gray-700 text-sm">
                  📧 البريد الإلكتروني أو رقم الهاتف
                </Label>
                <div className="relative">
                  <Input
                    id="emailOrPhone"
                    placeholder="example@email.com أو 01234567890"
                    className="text-right pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 text-sm sm:text-base"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transform hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <span>⏳ جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span>📤 إرسال رمز الاستعادة</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-2 sm:pt-4">
              <button
                onClick={() => {
                  window.location.href = "/"
                }}
                className="inline-flex items-center text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2" />🔙 العودة لتسجيل الدخول
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
