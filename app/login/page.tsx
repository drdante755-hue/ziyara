"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, User, Lock, Heart, Stethoscope, Loader2 } from "lucide-react"
import EnhancedFloatingMedicalIcons from "@/components/enhanced-floating-medical-icons"
import Image from "next/image"
import { Browser } from '@capacitor/browser'

export default function LoginPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => setIsPageLoading(false), [])

  // Redirect if logged in
  useEffect(() => {
    if (!session?.user?.email) return
    const checkSession = async () => {
      const refreshed = await getSession()
      if (!refreshed?.user?.email) return
      router.push("/user/home")
    }
    checkSession()
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
      if (res?.error) setError("بيانات تسجيل الدخول غير صحيحة")
      else router.push("/user/home")
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    try {
      await Browser.open({
        url: 'https://ziyara-tau.vercel.app/api/auth/signin/google?callbackUrl=https://ziyara-tau.vercel.app/oauth/redirect',
        windowName: '_self',
      })
    } catch (err) {
      console.error(err)
      setError("حدث خطأ أثناء فتح نافذة تسجيل الدخول بجوجل.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (isPageLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <EnhancedFloatingMedicalIcons />
      <div className="flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md lg:max-w-lg">
          <CardHeader className="text-center space-y-6 pb-8 px-8 pt-8">
            <Image src="/images/Ziyara-logo.png" alt="زيارة" width={160} height={160} className="mx-auto" />
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-emerald-500" />
                <h1 className="text-3xl font-bold text-emerald-700">زيارة</h1>
                <Stethoscope className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-emerald-600 font-semibold">منصة الرعاية الصحية الذكية</p>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">تسجيل الدخول</CardTitle>
            <CardDescription className="text-gray-600 text-base px-4">انضم إلى أكبر منصة رعاية صحية في المنطقة واستمتع بخدماتنا المتميزة</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 mb-4 h-12" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
              {isGoogleLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري تسجيل الدخول...</span></> : "تسجيل الدخول بحساب Google"}
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">أو</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Label htmlFor="emailOrPhone">البريد الإلكتروني أو رقم الهاتف</Label>
              <Input id="emailOrPhone" placeholder="example@email.com أو 01234567890" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} disabled={isLoading} required />
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required />
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="btn-primary w-full" disabled={isLoading || isGoogleLoading}>{isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}</Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
              ليس لديك حساب؟ <Link href="/register" className="text-primary font-semibold hover:underline">إنشاء حساب جديد</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
