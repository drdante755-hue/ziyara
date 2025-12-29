"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Preferences } from "@capacitor/preferences"
import { Browser } from '@capacitor/browser'

export default function OAuthRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      // لو فيه query param باسم token
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")

      if (token) {
        await Preferences.set({ key: "googleToken", value: token })
        router.push("/user/home")
      } else {
        router.push("/login")
      }

      // أغلق نافذة الـ Browser لو مستخدمين Capacitor
      try {
        await Browser.close()
      } catch (err) {
        console.log("Browser not open or error closing:", err)
      }
    }

    handleRedirect()
  }, [router])

  return <div className="min-h-screen flex items-center justify-center">جارٍ تسجيل الدخول...</div>
}
