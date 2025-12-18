"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  FlaskConical,
  Loader2,
  CheckCircle,
  Search,
  X,
  Clock,
  FileText,
  Phone,
  MapPin,
  Calendar,
  User,
  Sparkles,
  Activity,
  TestTube,
  Microscope,
  Home,
  Shield,
  Truck,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface LabTest {
  _id: string
  name: string
  price: number
  description?: string
  category: string
  duration: string
  isActive: boolean
}

export default function LabTestPage() {
  const router = useRouter()
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    whatsapp: "",
    address: "",
    date: "",
    time: "",
    notes: "",
  })

  const fetchTests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== "الكل") {
        params.set("category", selectedCategory)
      }
      if (searchQuery) {
        params.set("search", searchQuery)
      }

      const response = await fetch(`/api/tests?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLabTests(data.data || [])
        setCategories(data.categories || [])
      } else {
        setError(data.error || "فشل في جلب التحاليل")
      }
    } catch (err) {
      console.error("Error fetching tests:", err)
      setError("فشل في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const handleSelectTest = (testId: string) => {
    setSelectedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedTests.length === 0) {
      alert("الرجاء اختيار تحليل واحد على الأقل")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/requests/lab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tests: selectedTests,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setStep(3)
      } else {
        alert(data.error || "حدث خطأ أثناء الحجز")
      }
    } catch (err) {
      console.error("Error submitting request:", err)
      alert("فشل في الاتصال بالخادم")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTestsData = labTests.filter((test) => selectedTests.includes(test._id))
  const totalPrice = selectedTestsData.reduce((sum, test) => sum + test.price, 0)

  const resetForm = () => {
    setStep(1)
    setSelectedTests([])
    setForm({
      patientName: "",
      phone: "",
      whatsapp: "",
      address: "",
      date: "",
      time: "",
      notes: "",
    })
    setSuccess(false)
  }

  const TestsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="rounded-2xl">
          <CardContent className="p-4">
            <Skeleton className="aspect-square rounded-xl mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Step 2: نموذج الحجز
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-xl rounded-3xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">بيانات الحجز</h2>
              </div>

              {/* ملخص التحاليل المختارة */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 mb-6 border border-cyan-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-cyan-600" />
                  التحاليل المختارة ({selectedTestsData.length})
                </h3>
                <div className="space-y-3">
                  {selectedTestsData.map((test) => (
                    <div key={test._id} className="flex justify-between items-center bg-white rounded-xl p-3">
                      <span className="text-gray-700 font-medium">{test.name}</span>
                      <span className="font-bold text-cyan-600">{test.price} ج.م</span>
                    </div>
                  ))}
                  <div className="border-t-2 border-cyan-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg">الإجمالي</span>
                    <span className="text-2xl font-black text-cyan-600">{totalPrice} ج.م</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="flex items-center gap-2 mb-2 text-gray-700">
                    <User className="w-4 h-4" />
                    الاسم الكامل *
                  </Label>
                  <Input
                    name="patientName"
                    required
                    value={form.patientName}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    className="text-right rounded-xl h-12"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      رقم الهاتف *
                    </Label>
                    <Input
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="01xxxxxxxxx"
                      className="text-right rounded-xl h-12"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      واتساب (اختياري)
                    </Label>
                    <Input
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="01xxxxxxxxx"
                      className="text-right rounded-xl h-12"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    العنوان بالتفصيل *
                  </Label>
                  <Textarea
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="المحافظة - المنطقة - الشارع - رقم العمارة - الشقة"
                    rows={2}
                    className="text-right rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      تاريخ الزيارة *
                    </Label>
                    <Input
                      name="date"
                      type="date"
                      required
                      value={form.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      الوقت المفضل
                    </Label>
                    <Input
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-gray-700">ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="أي ملاحظات أو تعليمات خاصة"
                    rows={2}
                    className="text-right rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl h-12 bg-transparent"
                    onClick={() => setStep(1)}
                  >
                    <ArrowRight className="w-4 h-4 ml-2" />
                    رجوع
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحجز...
                      </>
                    ) : (
                      "تأكيد الحجز"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: تأكيد النجاح
  if (step === 3 && success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="shadow-xl rounded-3xl border-0 max-w-lg w-full">
          <CardContent className="p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تم الحجز بنجاح!</h2>
            <p className="text-gray-600 mb-8 text-lg">سيتم التواصل معك قريباً لتأكيد موعد التحليل المنزلي.</p>
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl h-12"
                onClick={resetForm}
              >
                حجز تحليل آخر
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 bg-transparent"
                onClick={() => router.push("/user/lab-requests")}
              >
                متابعة طلباتي
              </Button>
              <Button variant="ghost" className="w-full rounded-xl h-12" onClick={() => router.push("/user/home")}>
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1: اختيار التحاليل - Main Page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Navigation */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/user/home"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة للصفحة الرئيسية</span>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">خدمة التحاليل المنزلية</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                تحاليل طبية في منزلك
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto lg:mx-0 lg:mr-0 leading-relaxed">
                احصل على جميع التحاليل الطبية وأنت في منزلك بكل راحة وأمان. فريقنا المتخصص يصل إليك في الموعد المحدد.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <TestTube className="w-6 h-6 text-amber-400" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{labTests.length}+</p>
                    <p className="text-xs text-white/60">تحليل متوفر</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Home className="w-6 h-6 text-emerald-400" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-xs text-white/60">خدمة منزلية</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Shield className="w-6 h-6 text-rose-400" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-xs text-white/60">نتائج دقيقة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl rotate-6 opacity-20" />
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20">
                  <Image
                    src="/medical-lab-test-blood-sample-professional.jpg"
                    alt="تحاليل منزلية"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Microscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">نتائج خلال</p>
                      <p className="text-xl font-bold text-gray-900">24 ساعة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* Tests Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">اختر التحاليل المطلوبة</h2>
          <p className="text-gray-600 text-lg">يمكنك اختيار أكثر من تحليل في نفس الزيارة</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-6">
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن تحليل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-14 text-lg bg-white rounded-2xl border-gray-200 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === "الكل" ? "default" : "outline"}
                onClick={() => setSelectedCategory("الكل")}
                className={`rounded-full px-6 ${selectedCategory === "الكل" ? "bg-cyan-600 hover:bg-cyan-700" : ""}`}
              >
                الكل
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 ${selectedCategory === category ? "bg-cyan-600 hover:bg-cyan-700" : ""}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Tests Grid */}
        {isLoading ? (
          <TestsSkeleton />
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
            <Button onClick={fetchTests} className="bg-cyan-600 hover:bg-cyan-700 rounded-full px-8">
              إعادة المحاولة
            </Button>
          </div>
        ) : labTests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-10 h-10 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد تحاليل متاحة</h2>
            <p className="text-gray-600 mb-8">عذراً، لا توجد تحاليل متوفرة حالياً. يرجى المحاولة لاحقاً.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {labTests.map((test) => {
                const isSelected = selectedTests.includes(test._id)
                return (
                  <Card
                    key={test._id}
                    className={`group cursor-pointer bg-white hover:shadow-xl transition-all duration-300 border-2 overflow-hidden rounded-2xl ${
                      isSelected ? "border-cyan-500 ring-2 ring-cyan-200" : "border-transparent shadow-md"
                    }`}
                    onClick={() => handleSelectTest(test._id)}
                  >
                    <div className={`relative overflow-hidden ${isSelected ? "bg-cyan-50" : "bg-gray-50"}`}>
                      <div className="aspect-square relative flex items-center justify-center">
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                              : "bg-white shadow-md group-hover:shadow-lg"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                          ) : (
                            <FlaskConical className="w-10 h-10 text-cyan-600" />
                          )}
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-100 text-blue-700 font-medium text-xs px-2.5 py-1 rounded-lg">
                          {test.category}
                        </Badge>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 left-3">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Test Name */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-cyan-600 transition-colors">
                        {test.name}
                      </h3>

                      {/* Description */}
                      {test.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                      )}

                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{test.duration}</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-cyan-600">{test.price}</span>
                        <span className="text-sm text-gray-500">ج.م</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Bottom CTA Section */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">لماذا التحاليل المنزلية؟</h3>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-white/80">
                    <Home className="w-5 h-5 text-cyan-400" />
                    <span>راحة في منزلك</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span>نتائج دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Truck className="w-5 h-5 text-amber-400" />
                    <span>خدمة سريعة</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="bg-white text-gray-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full"
                >
                  <Link href="/user/lab-requests">
                    <FileText className="w-5 h-5 ml-2" />
                    متابعة طلباتي
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Bar - Selected Tests */}
      {selectedTests.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <p className="text-gray-600">
                تم اختيار <span className="font-bold text-cyan-600">{selectedTests.length}</span> تحليل
              </p>
              <p className="text-xl font-bold text-gray-900">
                الإجمالي: <span className="text-cyan-600">{totalPrice} ج.م</span>
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-10 rounded-full h-14 text-lg"
              onClick={() => setStep(2)}
            >
              متابعة الحجز
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for fixed bottom bar */}
      {selectedTests.length > 0 && <div className="h-24" />}
    </div>
  )
}
