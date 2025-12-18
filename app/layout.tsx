import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { NextAuthProvider } from "@/components/session-provider"

import "@/lib/polyfills"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "زيارة - منصة الرعاية الصحية الذكية",
  description: "زيارة - منصتك الذكية للأدوية والمنتجات الصحية مع خدمة توصيل سريعة وآمنة. أكثر من 50,000 عميل يثق بنا.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className} suppressHydrationWarning>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
