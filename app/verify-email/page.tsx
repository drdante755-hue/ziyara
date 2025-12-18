"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, RefreshCw, Mail, CheckCircle } from "lucide-react"
import FloatingMedicalIcons from "@/components/floating-medical-icons"
import VerificationCodeInput from "@/components/verification-code-input"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // ✅ FIX: Check actual verification status from API, not just session
    if (status === "authenticated" && session?.user?.email) {
      const checkVerificationStatus = async () => {
        try {
          const response = await fetch("/api/user/check-profile")
          const data = await response.json()
          
          if (data.success && data.emailVerified) {
            // Email is already verified - skip this page
            if (data.profileCompleted) {
              router.push("/user/home")
            } else {
              router.push("/user/user-info")
            }
            return
          }
        } catch (error) {
          console.error("Error checking verification status:", error)
          // Continue with verification flow if check fails
        }
      }
      
      checkVerificationStatus()
    }

    // Start countdown timer
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
  }, [session, status, router])

  const handleCodeComplete = async (code: string) => {
    if (!session?.user?.email) {
      setError("يجب تسجيل الدخول أولاً")
      return
    }

    setIsVerifying(true)
    setError("")
    
    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          code: code,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || data.message || "رمز التحقق غير صحيح")
        setIsVerifying(false)
        return
      }

      // ✅ Success - update session and redirect to user-info page
      // Refresh session to get updated emailVerified status
      if (typeof window !== 'undefined') {
        // Small delay to ensure DB update is complete
        setTimeout(() => {
          router.push("/user/user-info")
        }, 1000)
      }
    } catch (err: any) {
      console.error("Verification error:", err)
      setError("حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى")
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!session?.user?.email) {
      setError("يجب تسجيل الدخول أولاً")
      return
    }

    setIsResending(true)
    setError("")
    
    try {
      const response = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "فشل إعادة إرسال الرمز")
      } else {
        setTimeLeft(120) // Reset timer
      }
    } catch (err: any) {
      console.error("Resend code error:", err)
      setError("حدث خطأ أثناء إعادة الإرسال. يرجى المحاولة مرة أخرى")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const maskEmail = (email: string) => {
    if (!email) return ""
    const [username, domain] = email.split("@")
    const maskedUsername = username.length > 2 ? username.substring(0, 2) + "*".repeat(username.length - 2) : username
    return `${maskedUsername}@${domain}`
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.email) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
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
                  <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  زيارة
                </h1>
                <p className="text-sm sm:text-base text-emerald-600 font-medium">منصة الرعاية الصحية الذكية</p>
              </div>
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              📧 تأكيد البريد الإلكتروني
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">
              🔢 لقد أرسلنا رمز التحقق المكون من 6 أرقام إلى
              <br />
              <span className="font-semibold text-emerald-600">
                {maskEmail(session.user.email || "")}
              </span>
            </CardDescription>
            
            {/* ✅ Progress Indicator */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>تقدم التسجيل</span>
                <span className="font-semibold text-emerald-600">الخطوة 1 من 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                  className="w-1/2"
                ></div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-emerald-600">التحقق من البريد</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>إكمال البيانات</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-4 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Verification Code Input */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full mb-4">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
              </div>

              <VerificationCodeInput length={6} onComplete={handleCodeComplete} onCodeChange={setVerificationCode} />

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  ⏰ انتهاء صلاحية الرمز خلال{" "}
                  <span className="font-mono font-semibold text-emerald-600">{formatTime(timeLeft)}</span>
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleCodeComplete(verificationCode)}
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

            {/* Resend Code */}
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">❓ لم تستلم الرمز؟</p>
              <Button
                variant="outline"
                onClick={handleResendCode}
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

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>💡 نصيحة:</strong> يمكنك لصق الرمز مباشرة من رسالة البريد الإلكتروني أو كتابته رقماً بعد رقم
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
