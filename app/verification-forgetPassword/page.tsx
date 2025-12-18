"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, RefreshCw, Mail, Smartphone } from "lucide-react"
import FloatingMedicalIcons from "@/components/floating-medical-icons"
import VerificationCodeInput from "@/components/verification-code-input"
import { apiFetch, getApiBaseUrl } from "@/lib/api"

export default function VerificationForgotPasswordPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [method, setMethod] = useState<"phone" | "email" | null>(null)
  const [target, setTarget] = useState<string>("")

  useEffect(() => {
    // expected: localStorage keys set by forgot-password page
    const m = localStorage.getItem("fp_method") as any
    const t = localStorage.getItem("fp_target") || ""
    if (!m || !t) {
      window.location.href = "/forgot-password"
      return
    }
    setMethod(m === "phone" ? "phone" : "email")
    setTarget(t)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const maskPhone = (phone: string) => {
    if (!phone) return ""
    return phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")
  }

  const maskEmail = (email: string) => {
    if (!email) return ""
    const [username, domain] = email.split("@")
    const maskedUsername = username.length > 2 ? username.substring(0, 2) + "*".repeat(username.length - 2) : username
    return `${maskedUsername}@${domain}`
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return
    setIsVerifying(true)
    try {
      const apiBase = getApiBaseUrl()
      if (apiBase) {
        await apiFetch("/auth/forgot-password/verify", {
          method: "POST",
          body:
            method === "email" ? { email: target, code: verificationCode } : { phone: target, code: verificationCode },
        })
      } else {
        await new Promise((r) => setTimeout(r, 800))
      }
      // On success, move to reset password page (to be implemented by backend route)
      window.location.href = "/user-info"
    } catch (e) {
      alert("رمز التحقق غير صحيح أو منتهي الصلاحية")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const apiBase = getApiBaseUrl()
      if (apiBase) {
        await apiFetch("/auth/forgot-password/send-code", {
          method: "POST",
          body: method === "email" ? { email: target } : { phone: target },
        })
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      setTimeLeft(120)
    } catch (e) {
      alert("تعذر إعادة إرسال الرمز، حاول لاحقاً")
    } finally {
      setIsResending(false)
    }
  }

  if (!method || !target) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="pt-6 px-4 flex justify-end"></div>
      <FloatingMedicalIcons />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-3 sm:p-4 lg:p-6">
        <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="text-center space-y-4 sm:space-y-6 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  زيارة
                </h1>
                <p className="text-sm sm:text-base text-emerald-600 font-medium">منصة الرعاية الصحية الذكية</p>
              </div>
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">🔐 تأكيد استعادة كلمة المرور</CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
              🔢 أدخل رمز التحقق المرسل إلى
              <br />
              <span className="font-semibold text-emerald-600">
                {method === "phone" ? `+20 ${maskPhone(target)}` : maskEmail(target)}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full mb-4">
                  {method === "phone" ? (
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                  ) : (
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                  )}
                </div>
              </div>

              <VerificationCodeInput length={6} onComplete={setVerificationCode} onCodeChange={setVerificationCode} />

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ⏰ انتهاء صلاحية الرمز خلال{" "}
                  <span className="font-mono font-semibold text-emerald-600">{`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`}</span>
                </p>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:scale-[1.02] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  <span>⏳ جاري التحقق...</span>
                </>
              ) : (
                <>
                  <span>✅ تأكيد الرمز</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">❓ لم تستلم الرمز؟</p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || timeLeft > 60}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />⏳ جاري الإرسال...
                  </>
                ) : (
                  "🔄 إعادة إرسال الرمز"
                )}
              </Button>
            </div>

            <div className="text-center pt-2 sm:pt-4 border-t border-gray-200/50">
              <Link
                href="/forgot-password"
                className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-600 font-medium hover:underline transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة لتغيير الطريقة
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
