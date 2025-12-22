"use client"

import { useEffect } from "react"

export default function MobileSuccess() {
  useEffect(() => {
    // رجوع للتطبيق عن طريق Deep Link
    window.location.href = "com.firstapp.learnapk://oauth-redirect"

    // fallback لو التطبيق مش متسطب
    const timer = setTimeout(() => {
      window.location.href = "/"
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>تم تسجيل الدخول بنجاح</h2>
      <p>يتم الرجوع للتطبيق...</p>
    </div>
  )
}
