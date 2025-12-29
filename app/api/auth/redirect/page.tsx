// app/oauth/redirect/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token") || ""
    const email = params.get("email") || ""

    // تحويل كل الروابط داخلياً في WebView
    const internalUrl = `/user/home?token=${token}&email=${encodeURIComponent(email)}`
    router.replace(internalUrl)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-lg font-medium text-emerald-700">
        جاري تسجيل الدخول وتحويلك للتطبيق...
      </p>
    </div>
  )
}
