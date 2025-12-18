"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ConfigStatus {
  google: {
    clientId: boolean
    clientSecret: boolean
    configured: boolean
  }
  mongodb: boolean
  nextauth: {
    secret: boolean
    url: string
  }
  allConfigured: boolean
}

export default function CheckEnvPage() {
  const [config, setConfig] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/auth/check-google-config")
        const data = await response.json()
        setConfig(data)
      } catch (error) {
        console.error("Error checking config:", error)
      } finally {
        setLoading(false)
      }
    }
    checkConfig()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p>جاري التحقق من الإعدادات...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>حالة إعدادات التطبيق</CardTitle>
          <CardDescription>تحقق من إعدادات متغيرات البيئة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Google OAuth</h3>
              {config?.google.configured ? (
                <Badge className="bg-green-500">معد</Badge>
              ) : (
                <Badge className="bg-red-500">غير معد</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {config?.google.clientId ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>GOOGLE_CLIENT_ID: {config?.google.clientId ? "موجود" : "غير موجود"}</span>
              </div>
              <div className="flex items-center gap-2">
                {config?.google.clientSecret ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>GOOGLE_CLIENT_SECRET: {config?.google.clientSecret ? "موجود" : "غير موجود"}</span>
              </div>
            </div>
          </div>

          {/* MongoDB */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">MongoDB</h3>
              {config?.mongodb ? (
                <Badge className="bg-green-500">معد</Badge>
              ) : (
                <Badge className="bg-red-500">غير معد</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {config?.mongodb ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>MONGODB_URI: {config?.mongodb ? "موجود" : "غير موجود"}</span>
            </div>
          </div>

          {/* NextAuth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">NextAuth</h3>
              {config?.nextauth.secret ? (
                <Badge className="bg-green-500">معد</Badge>
              ) : (
                <Badge className="bg-red-500">غير معد</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {config?.nextauth.secret ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>NEXTAUTH_SECRET: {config?.nextauth.secret ? "موجود" : "غير موجود"}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span>NEXTAUTH_URL: {config?.nextauth.url}</span>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">الحالة العامة</h3>
              {config?.allConfigured ? (
                <Badge className="bg-green-500 text-lg px-4 py-2">✅ كل شيء معد بشكل صحيح</Badge>
              ) : (
                <Badge className="bg-red-500 text-lg px-4 py-2">❌ بعض الإعدادات مفقودة</Badge>
              )}
            </div>
          </div>

          {/* Instructions */}
          {!config?.allConfigured && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">تعليمات الإعداد:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                <li>أنشئ ملف `.env.local` في جذر المشروع</li>
                <li>انسخ محتوى `env.example.txt` إلى `.env.local`</li>
                <li>املأ جميع القيم المطلوبة</li>
                <li>أعد تشغيل السيرفر (Ctrl+C ثم npm run dev)</li>
                <li>حدّث هذه الصفحة للتحقق مرة أخرى</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
