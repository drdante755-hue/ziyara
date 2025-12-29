"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, User, Lock, Heart, Stethoscope, Loader2 } from "lucide-react"
import EnhancedFloatingMedicalIcons from "@/components/enhanced-floating-medical-icons"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    setHasRedirected(false)
    const timer = setTimeout(() => setIsPageLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get("error")
    const errorDescription = params.get("error_description")

    if (oauthError) {
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول عبر Google."

      switch (oauthError) {
        case "OAuthCallback":
          errorMessage = "حدث خطأ أثناء عملية تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى."
          break
        case "OAuthSignin":
          errorMessage = "فشل بدء عملية تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى."
          break
        case "OAuthCreateAccount":
          errorMessage = "فشل إنشاء الحساب عبر Google. يرجى المحاولة مرة أخرى."
          break
        case "Callback":
          errorMessage = "حدث خطأ أثناء معالجة استجابة Google. يرجى المحاولة مرة أخرى."
          break
        case "OAuthAccountNotLinked":
          errorMessage = "هذا الحساب مرتبط بحساب آخر. يرجى تسجيل الدخول بالطريقة الأصلية."
          break
        case "EmailSignin":
          errorMessage = "فشل إرسال بريد التحقق. يرجى المحاولة مرة أخرى."
          break
        case "CredentialsSignin":
          errorMessage = "فشل تسجيل الدخول. تحقق من بيانات الاعتماد الخاصة بك."
          break
        default:
          errorMessage = errorDescription
            ? decodeURIComponent(errorDescription)
            : "حدث خطأ غير معروف أثناء تسجيل الدخول عبر Google."
      }

      setError(errorMessage)
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [router])

  useEffect(() => {
    if (hasRedirected || !session?.user?.email) return

    const checkSessionAndRedirect = async () => {
      setIsPageLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const refreshedSession = await getSession()
        if (!refreshedSession?.user?.email) {
          console.log("No session after refresh, skipping redirect")
          setIsPageLoading(false)
          return
        }

        const response = await fetch("/api/user/check-profile")
        const data = await response.json()

        if (!response.ok || !data.success) {
          console.error("Failed to check profile:", data.error)
          setIsPageLoading(false)
          return
        }

        if (refreshedSession.user.role === "admin") {
          console.log("✅ Redirecting admin to dashboard")
          setHasRedirected(true)
          router.push("/admin/dashboard")
          return
        }

        const emailVerified = data.emailVerified || false
        const profileCompleted = data.profileCompleted || false

        console.log("User status:", { emailVerified, profileCompleted })

        if (!emailVerified) {
          console.log("✅ Redirecting to verify-email (email not verified)")
          setHasRedirected(true)
          router.push("/verify-email")
          return
        }

        if (!profileCompleted) {
          console.log("✅ Redirecting to user-info (profile not completed)")
          setHasRedirected(true)
          router.push("/user/user-info")
          return
        }

        console.log("✅ Redirecting to home (all complete)")
        setHasRedirected(true)
        router.push("/user/home")
      } catch (error) {
        console.error("Error checking user profile:", error)
        setIsPageLoading(false)
        if (session.user.role === "admin") {
          setHasRedirected(true)
          router.push("/admin/dashboard")
        } else {
          if (!session.user.emailVerified) {
            setHasRedirected(true)
            router.push("/verify-email")
          } else {
            setHasRedirected(true)
            router.push("/user/home")
          }
        }
      }
    }

    checkSessionAndRedirect()
  }, [session, router, hasRedirected])

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true)
    setError("")

    // ✅ استخدام Web OAuth الرسمي من NextAuth
    signIn("google", {
      callbackUrl: "/auth/mobile-success",
    }).finally(() => setIsGoogleLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!emailOrPhone || !password) {
      setError("الرجاء إدخال البريد الإلكتروني/رقم الهاتف وكلمة المرور")
      setIsLoading(false)
      return
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        emailOrPhone,
        password,
      })

      if (res?.error) {
        setError("بيانات تسجيل الدخول غير صحيحة")
        setIsLoading(false)
        return
      }

      if (res?.ok) {
        const newSession = await getSession()
        if (newSession?.user?.role) {
          if (newSession.user.role === "admin") router.push("/admin/dashboard")
          else router.push("/user/home")
        } else {
          setTimeout(async () => {
            const retrySession = await getSession()
            if (retrySession?.user?.role) {
              if (retrySession.user.role === "admin") router.push("/admin/dashboard")
              else router.push("/user/home")
            } else {
              router.push("/")
            }
          }, 300)
        }
      }

      setIsLoading(false)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err?.message || "حدث خطأ أثناء تسجيل الدخول")
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden flex items-center justify-center">
        <EnhancedFloatingMedicalIcons />
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md lg:max-w-lg">
          <CardHeader className="text-center space-y-6 pb-8 px-8 pt-8">
            <div className="relative">
              <Image
                src="/images/Ziyara-logo.png"
                alt="زيارة - منصة الرعاية الصحية"
                width={160}
                height={160}
                className="mx-auto"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-emerald-500" />
                <h1 className="text-3xl font-bold text-emerald-700">زيارة</h1>
                <Stethoscope className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-emerald-600 font-semibold">منصة الرعاية الصحية الذكية</p>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-800">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-600 text-base px-4">
              انضم إلى أكبر منصة رعاية صحية في المنطقة واستمتع بخدماتنا المتميزة
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* زر Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mb-4 border-2 hover:bg-gray-50 h-12 bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب Google</span>
                </>
              )}
            </Button>

            {/* فصل بين الخيارات */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">أو</span>
              </div>
            </div>

            {/* نموذج البريد/رقم الهاتف */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="emailOrPhone">البريد الإلكتروني أو رقم الهاتف</Label>
                <div className="relative">
                  <Input
                    id="emailOrPhone"
                    placeholder="example@email.com أو 01234567890"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    disabled={isLoading}
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <Button type="submit" className="btn-primary w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
