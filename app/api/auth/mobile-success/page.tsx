"use client"

import { useEffect } from "react"

export default function MobileSuccess() {
  useEffect(() => {
    // يفتح التطبيق
    window.location.href = "/api/auth/signin/google?callbackUrl=" +
    encodeURIComponent("https://ziyara-tau.vercel.app/auth/mobile-success")

    // fallback لو التطبيق مش متسطب
    setTimeout(() => {
      window.location.href = "/"
    }, 1500)
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>جاري تسجيل الدخول...</h2>
      <p>سيتم تحويلك للتطبيق تلقائيًا</p>
    </div>
  )
}
