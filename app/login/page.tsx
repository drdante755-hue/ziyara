// app/login/page.tsx
"use client"

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
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    setIsPageLoading(false)
  }, [])

  useEffect(() => {
    if (!session?.user?.email) return

    const checkSessionAndRedirect = async () => {
      try {
        const refreshedSession = await getSession()
        if (!refreshedSession?.user?.email) return

        const response = await fetch("/api/user/check-profile")
        const data = await response.json()

        if (!response.ok || !data.success) return

        if (refreshedSession.user.role === "admin") {
          router.push("/admin/dashboard")
          return
        }

        if (!data.emailVerified) {
          router.push("/verify-email")
          return
        }

        if (!data.profileCompleted) {
          router.push("/user/user-info")
          return
        }

        router.push("/user/home")
      } catch (err) {
        console.error("Error checking session:", err)
      }
    }

    checkSessionAndRedirect()
  }, [session, router])

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
      } else {
        const newSession = await getSession()
        router.push("/user/home")
      }
    } catch (err) {
      console.error(err)
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />

      <div className="flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md lg:max-w-lg">
          <CardHeader className="text-center space-y-6 pb-8 px-8 pt-8">
            <div className="relative">
              <Image src="/images/Ziyara-logo.png" alt="زيارة" width={160} height={160} className="mx-auto" />
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

              <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
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
