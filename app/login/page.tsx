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
          if (newSession.user.role === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/user/home")
          }
        } else {
          setTimeout(async () => {
            const retrySession = await getSession()
            if (retrySession?.user?.role) {
              if (retrySession.user.role === "admin") {
                router.push("/admin/dashboard")
              } else {
                router.push("/user/home")
              }
            } else {
              console.warn("لم يتم العثور على role في session، التوجيه إلى الصفحة الرئيسية")
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

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-cyan-400/25 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 p-8">
          <div className="relative">
            <div className="w-40 h-40 mx-auto relative animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-xl"></div>
              <Image
                src="/images/Ziyara-logo.png"
                alt="زيارة - منصة الرعاية الصحية"
                width={160}
                height={160}
                className="object-contain w-full h-full relative z-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <div className="space-y-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                جاري التحميل...
              </h2>
              <p className="text-sm text-emerald-600/80">يرجى الانتظار</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-cyan-400/25 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md lg:max-w-lg card-enhanced">
          <CardHeader className="text-center space-y-6 pb-8 px-8 pt-8">
            <div className="relative">
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
                <Image
                  src="/images/Ziyara-logo.png"
                  alt="زيارة - منصة الرعاية الصحية"
                  width={160}
                  height={160}
                  className="object-contain w-full h-full relative z-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-emerald-500" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  زيارة
                </h1>
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

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">أو</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="emailOrPhone">البريد الإلكتروني أو رقم الهاتف</Label>
                <div className="relative">
                  <Input
                    id="emailOrPhone"
                    placeholder="example@email.com أو 01234567890"
                    className="form-input pr-12"
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
                    className="form-input pr-12"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm font-medium text-center bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}
            </form>

            <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors duration-200"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
