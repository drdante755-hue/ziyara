"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  HeartPulse,
  Loader2,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  CheckCircle,
  Users,
  Home,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface NursingService {
  id: string
  name: string
  nameAr: string
  description?: string
  price: number
  priceType: "hourly" | "daily" | "visit"
  category: string
  duration?: string
  rating: number
  reviewsCount: number
  isAvailable: boolean
  coverageAreas?: string[]
  image?: string
}

const categories = ["رعاية مسنين", "رعاية ما بعد العمليات", "حقن وتضميد", "علاج طبيعي", "رعاية أطفال"]

const serviceImages: Record<string, string> = {
  "رعاية مسنين": "/elderly-care-nursing.jpg",
  "رعاية ما بعد العمليات": "/post-surgery-care.jpg",
  "حقن وتضميد": "/wound-care-nursing.jpg",
  "علاج طبيعي": "/physical-therapy-home.jpg",
  "رعاية أطفال": "/home-nursing-care-professional.jpg",
}

export default function HomeNursingPage() {
  const [services, setServices] = useState<NursingService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category !== "all") params.append("category", category)

      const res = await fetch(`/api/nursing-services?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchServices()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setTimeout(fetchServices, 100)
  }

  const priceLabel = {
    hourly: "/ ساعة",
    daily: "/ يوم",
    visit: "/ زيارة",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-rose-900 overflow-hidden">
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
                <HeartPulse className="w-4 h-4 text-rose-300" />
                <span className="text-sm font-medium">رعاية صحية منزلية</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">التمريض المنزلي</h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                خدمات تمريض احترافية في راحة منزلك مع فريق طبي متخصص ومدرب على أعلى مستوى
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Users className="w-6 h-6 text-rose-300" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{services.length}</p>
                    <p className="text-xs text-white/60">خدمة متاحة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <Home className="w-6 h-6 text-rose-300" />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-xs text-white/60">خدمة متواصلة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 rounded-3xl rotate-6 opacity-20" />
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20">
                  <Image
                    src="/home-nursing-care-professional.jpg"
                    alt="التمريض المنزلي"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center">
                      <HeartPulse className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">رعاية متكاملة</p>
                      <p className="text-lg font-bold text-gray-900">في منزلك</p>
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
              placeholder="ابحث عن خدمة تمريض..."
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
                  <Label>نوع الخدمة</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="جميع الخدمات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الخدمات</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSearch} className="flex-1 bg-rose-600 hover:bg-rose-700 rounded-xl">
                    تطبيق
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl bg-transparent">
                    مسح
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSearch} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
            بحث
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartPulse className="w-10 h-10 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد خدمات</h2>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
            <Button onClick={clearFilters} className="bg-rose-600 hover:bg-rose-700 rounded-full px-8">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{services.length} خدمة تمريض</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <Link key={service.id} href={`/user/home-nursing/${service.id}`} className="group">
                  <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                    <div className="relative overflow-hidden bg-gray-100">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={
                            service.image ||
                            serviceImages[service.category] ||
                            `/placeholder.svg?height=300&width=400&query=nursing care ${service.category || "/placeholder.svg"}`
                          }
                          alt={service.nameAr}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute top-3 right-3">
                        {service.isAvailable ? (
                          <Badge className="bg-emerald-500 text-white gap-1">
                            <CheckCircle className="w-3 h-3" />
                            متاح
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white">غير متاح</Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-full">
                        {service.category}
                      </span>
                      <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {service.nameAr}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-sm">{service.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-400 text-sm">({service.reviewsCount})</span>
                        {service.duration && (
                          <>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <Clock className="w-3 h-3" />
                              <span>{service.duration}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <span className="text-xl font-bold text-gray-900">{service.price}</span>
                          <span className="text-sm text-gray-500 mr-1">ج.م {priceLabel[service.priceType]}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 rounded-lg text-xs"
                          disabled={!service.isAvailable}
                        >
                          {service.isAvailable ? "احجز الآن" : "غير متاح"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-rose-900 to-rose-800 rounded-3xl p-8 md:p-12 text-center">
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">هل تحتاج مساعدة؟</h3>
                <p className="text-rose-100 mb-8 max-w-xl mx-auto">
                  فريقنا الطبي متاح على مدار الساعة لمساعدتك في اختيار الخدمة المناسبة
                </p>
                <Button
                  asChild
                  className="bg-white text-rose-900 hover:bg-gray-100 text-base py-3 px-8 font-semibold rounded-full"
                >
                  <Link href="/user/contact">
                    <HeartPulse className="w-5 h-5 ml-2" />
                    تواصل معنا
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
