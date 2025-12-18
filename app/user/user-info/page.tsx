"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FloatingMedicalIcons from "@/components/floating-medical-icons"
import { User, Phone, Mail, Calendar, AlertTriangle, CheckCircle, Loader2, MapPin } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  age: string
  phone: string
  email: string
  address: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  age?: string
  phone?: string
  email?: string
  address?: string
}

export default function UserInfoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    age: "",
    phone: "",
    email: "",
    address: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // تحميل بيانات المستخدم من الجلسة والتحقق من إكمال الملف الشخصي
  useEffect(() => {
    const loadUserData = async () => {
      if (status === "authenticated" && session?.user) {
        // التحقق من حالة المستخدم (emailVerified, profileCompleted)
        try {
          const response = await fetch("/api/user/check-profile")
          const data = await response.json()
          
          // ✅ Step 1: Check if email is verified
          if (data.success && !data.emailVerified) {
            // Email not verified - redirect to verify-email
            router.push("/verify-email")
            return
          }
          
          // ✅ Step 2: Check if profile is already completed
          if (data.success && data.profileCompleted) {
            // إذا أكمل المستخدم بياناته بالفعل، التوجيه إلى الصفحة الرئيسية
            router.push("/user/home")
            return
          }
          
          // تحميل البيانات من الجلسة
          setFormData((prev) => ({
            ...prev,
            email: session.user.email || "",
            firstName: data.user?.firstName || session.user.name?.split(" ")[0] || "",
            lastName: data.user?.lastName || session.user.name?.split(" ").slice(1).join(" ") || "",
            phone: data.user?.phone || "",
            age: data.user?.age?.toString() || "",
            address: data.user?.address || "",
          }))
        } catch (error) {
          console.error("Error loading user data:", error)
          // في حالة الخطأ، استخدم بيانات الجلسة فقط
          setFormData((prev) => ({
            ...prev,
            email: session.user.email || "",
            firstName: session.user.name?.split(" ")[0] || "",
            lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          }))
        }
      } else if (status === "unauthenticated") {
        // إذا لم يكن المستخدم مسجل دخول، التوجيه إلى صفحة تسجيل الدخول
        router.push("/login")
      }
    }
    
    loadUserData()
  }, [session, status, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "الاسم الأول يجب أن يكون أكثر من حرف واحد"
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "الاسم الأخير مطلوب"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "الاسم الأخير يجب أن يكون أكثر من حرف واحد"
    }

    // Validate age
    const age = Number.parseInt(formData.age)
    if (!formData.age) {
      newErrors.age = "العمر مطلوب"
    } else if (isNaN(age) || age < 16 || age > 100) {
      newErrors.age = "العمر يجب أن يكون بين 16 و 100 سنة"
    }

    // Validate phone
    const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب"
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "رقم الهاتف غير صحيح (يجب أن يكون رقم مصري صحيح)"
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "العنوان يجب أن يكون على الأقل 10 أحرف"
    }

    // Validate email (optional but should be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صحيح"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // إرسال البيانات إلى API
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrors({ email: data.error || "فشل حفظ البيانات" })
        setIsLoading(false)
        return
      }

      // ✅ Update session by refreshing it
      // This ensures the session reflects the new profileCompleted status
      if (typeof window !== 'undefined') {
        // Trigger session update
        window.location.reload()
      }

      // حفظ في localStorage أيضاً للاستخدام المحلي
      localStorage.setItem("userInfo", JSON.stringify(formData))

      setIsSubmitted(true)

      // ✅ Redirect to user home page after success
      setTimeout(() => {
        router.push("/user/home")
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ email: "حدث خطأ أثناء حفظ البيانات" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <FloatingMedicalIcons />
        <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم بنجاح!</h2>
            <p className="text-gray-600 mb-4">تم حفظ بياناتك بنجاح. سيتم توجيهك إلى الصفحة الرئيسية...</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
      <FloatingMedicalIcons />

      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              إكمال البيانات الشخصية
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-600 mt-2">
              يرجى إدخال بياناتك الشخصية لإكمال عملية التسجيل
            </CardDescription>
            
            {/* ✅ Progress Indicator */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>تقدم التسجيل</span>
                <span className="font-semibold text-emerald-600">الخطوة 2 من 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>التحقق من البريد</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-emerald-600">إكمال البيانات</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-right text-sm sm:text-base font-medium">
                    الاسم الأول *
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`pr-10 text-right h-10 sm:h-12 ${errors.firstName ? "border-red-500" : ""}`}
                      placeholder="أدخل الاسم الأول"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs sm:text-sm text-right">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-right text-sm sm:text-base font-medium">
                    الاسم الأخير *
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`pr-10 text-right h-10 sm:h-12 ${errors.lastName ? "border-red-500" : ""}`}
                      placeholder="أدخل الاسم الأخير"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.lastName && <p className="text-red-500 text-xs sm:text-sm text-right">{errors.lastName}</p>}
                </div>
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-right text-sm sm:text-base font-medium">
                  العمر *
                </Label>
                <div className="relative">
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className={`pr-10 text-right h-10 sm:h-12 ${errors.age ? "border-red-500" : ""}`}
                    placeholder="أدخل العمر"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                {errors.age && <p className="text-red-500 text-xs sm:text-sm text-right">{errors.age}</p>}
              </div>

              {/* Phone Field with WhatsApp Warning */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right text-sm sm:text-base font-medium">
                  رقم الهاتف *
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pr-10 text-right h-10 sm:h-12 ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>

                {/* WhatsApp Warning */}
                <Alert className="bg-green-50 border-green-200">
                  <AlertTriangle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs sm:text-sm text-right">
                    <strong>تنبيه مهم:</strong> يجب أن يكون هذا الرقم متاحاً على خدمة الواتساب لتلقي التحديثات والإشعارات
                    المهمة.
                  </AlertDescription>
                </Alert>

                {errors.phone && <p className="text-red-500 text-xs sm:text-sm text-right">{errors.phone}</p>}
              </div>

              {/* Email Field - ReadOnly */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right text-sm sm:text-base font-medium">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="pr-10 text-right h-10 sm:h-12 bg-gray-100 cursor-not-allowed"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-right">البريد الإلكتروني غير قابل للتعديل</p>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-right text-sm sm:text-base font-medium">
                  العنوان *
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`pr-10 text-right h-10 sm:h-12 ${errors.address ? "border-red-500" : ""}`}
                    placeholder="أدخل العنوان الكامل"
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                {errors.address && <p className="text-red-500 text-xs sm:text-sm text-right">{errors.address}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ البيانات والمتابعة"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
