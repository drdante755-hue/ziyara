"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function MobileSuccess() {
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // جلب session من NextAuth
        const session = await getSession()

        if (!session?.user?.email) {
          // لو مفيش session أو مفيش إيميل، نرجع لصفحة تسجيل الدخول
          router.replace("/login")
          return
        }

        // جلب بيانات المستخدم من API لو محتاج تحقق إضافي
        const res = await fetch("/api/user/check-profile")
        const data = await res.json()

        if (!res.ok || !data.success) {
          router.replace("/login")
          return
        }

        // إعادة التوجيه حسب حالة المستخدم
        if (session.user.role === "admin") {
          router.replace("/admin/dashboard")
        } else if (!data.emailVerified) {
          router.replace("/verify-email")
        } else if (!data.profileCompleted) {
          router.replace("/user/user-info")
        } else {
          router.replace("/user/home")
        }
      } catch (err) {
        console.error("MobileSuccess redirect error:", err)
        router.replace("/login")
      }
    }

    handleRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-lg font-medium text-emerald-700">
          جاري تسجيل الدخول وتحويلك للتطبيق...
        </p>
      </div>
    </div>
  )
}
