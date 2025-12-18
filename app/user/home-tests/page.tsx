"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  FlaskConical,
  Loader2,
  Search,
  SlidersHorizontal,
  Clock,
  Home,
  Sparkles,
  TestTube,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface LabTest {
  id: string
  name: string
  nameAr: string
  description?: string
  price: number
  originalPrice?: number
  category: string
  preparationTime?: string
  resultTime?: string
  homeCollection: boolean
  isPopular?: boolean
  image?: string
}

const categories = ["تحاليل الدم", "تحاليل البول", "تحاليل الهرمونات", "تحاليل السكر", "فحوصات شاملة"]

const categoryImages: Record<string, string> = {
  "تحاليل الدم": "/blood-test-laboratory.png",
  "تحاليل السكر": "/diabetes-blood-test.jpg",
  "تحاليل الهرمونات": "/hormones-test.jpg",
  "فحوصات شاملة": "/pre-marriage-test.jpg",
  "تحاليل البول": "/vitamins-test.jpg",
}

export default function HomeTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category !== "all") params.append("category", category)
      params.append("homeCollection", "true")

      const res = await fetch(`/api/lab-tests?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchTests()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setTimeout(fetchTests, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/user/home"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة للصفحة الرئيسية</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-right order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                <FlaskConical className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-medium">تحاليل منزلية</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">التحاليل المنزلية</h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                احجز تحاليلك الطبية ونصلك في المنزل مع نتائج دقيقة وسريعة من معامل معتمدة
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <TestTube className="w-6 h-6 text-purple-300" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{tests.length}</p>
                    <p className="text-xs text-white/60">تحليل متاح</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Home className="w-6 h-6 text-purple-300" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">مجاني</p>
                    <p className="text-xs text-white/60">سحب العينة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl rotate-6 opacity-20" />
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20">
                  <Image
                    src="/home-medical-test-laboratory.jpg"
                    alt="التحاليل المنزلية"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">النتيجة خلال</p>
                      <p className="text-lg font-bold text-gray-900">24 ساعة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن تحليل..."
              className="pr-10 rounded-xl border-gray-200"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2 bg-transparent">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">فلترة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>فلترة النتائج</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="جميع التصنيفات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التصنيفات</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSearch} className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl">
                    تطبيق
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl bg-transparent">
                    مسح
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
            بحث
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد تحاليل</h2>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
            <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700 rounded-full px-8">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{tests.length} تحليل متاح</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {tests.map((test) => {
                const discount = test.originalPrice
                  ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
                  : 0

                return (
                  <Link key={test.id} href={`/user/home-tests/${test.id}`} className="group">
                    <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                      <div className="relative overflow-hidden bg-gray-100">
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={
                              test.image ||
                              categoryImages[test.category] ||
                              `/placeholder.svg?height=300&width=300&query=medical lab test ${test.category || "/placeholder.svg"}`
                            }
                            alt={test.nameAr}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {discount > 0 && (
                            <Badge className="bg-rose-500 text-white font-bold text-xs px-2 py-1 rounded-lg shadow-lg">
                              -{discount}%
                            </Badge>
                          )}
                          {test.isPopular && (
                            <Badge className="bg-amber-500 text-white text-xs gap-1">
                              <Sparkles className="w-3 h-3" />
                              الأكثر طلباً
                            </Badge>
                          )}
                        </div>

                        {test.homeCollection && (
                          <Badge className="absolute bottom-3 right-3 bg-emerald-500 text-white gap-1">
                            <Home className="w-3 h-3" />
                            منزلي
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                          {test.category}
                        </span>

                        <h3 className="font-semibold text-gray-900 mt-2 mb-3 line-clamp-2 text-sm leading-snug group-hover:text-purple-600 transition-colors">
                          {test.nameAr}
                        </h3>

                        {test.resultTime && (
                          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>النتيجة خلال {test.resultTime}</span>
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 mb-4 pt-3 border-t">
                          <span className="text-lg font-bold text-gray-900">{test.price}</span>
                          <span className="text-xs text-gray-500">ج.م</span>
                          {test.originalPrice && (
                            <span className="text-sm text-gray-400 line-through mr-auto">{test.originalPrice}</span>
                          )}
                        </div>

                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2.5 rounded-xl">
                          احجز الآن
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">باقات التحاليل الشاملة</h3>
                <p className="text-purple-100 mb-8 max-w-xl mx-auto">
                  وفر أكثر مع باقاتنا الشاملة التي تغطي جميع احتياجاتك الصحية
                </p>
                <Button
                  asChild
                  className="bg-white text-purple-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full"
                >
                  <Link href="/user/home-tests/packages">
                    <FlaskConical className="w-5 h-5 ml-2" />
                    عرض الباقات
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
