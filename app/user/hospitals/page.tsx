"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  Building2,
  MapPin,
  Star,
  Loader2,
  Search,
  SlidersHorizontal,
  Ambulance,
  FlaskConical,
  Pill,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Hospital {
  isActive: any
  id: string
  name: string
  nameAr: string
  address: string
  city: string
  area: string
  phone: string
  emergencyPhone?: string
  images: string[]
  logo?: string
  departments: string[]
  specialties: string[]
  hasEmergency: boolean
  hasICU: boolean
  hasPharmacy: boolean
  hasLab: boolean
  bedCount?: number
  rating: number
  reviewsCount: number
  isFeatured: boolean
}

const cities = ["القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "طنطا", "الزقازيق"]

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [hasEmergency, setHasEmergency] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (city && city !== "all") params.append("city", city)
      if (hasEmergency) params.append("hasEmergency", "true")

      const res = await fetch(`/api/hospitals?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setHospitals(data.hospitals || [])
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchHospitals()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSearch("")
    setCity("all")
    setHasEmergency(false)
    setTimeout(fetchHospitals, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium">أفضل المستشفيات</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">المستشفيات</h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              ابحث عن أفضل المستشفيات والمراكز الطبية في منطقتك مع خدمات متكاملة وأطباء متخصصين
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-300" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{hospitals.length}</p>
                  <p className="text-xs text-white/60">مستشفى</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Ambulance className="w-6 h-6 text-red-400" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{hospitals.filter((h) => h.hasEmergency).length}</p>
                  <p className="text-xs text-white/60">طوارئ 24 ساعة</p>
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

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مستشفى..."
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
                  <Label>المدينة</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="جميع المدن" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المدن</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasEmergency"
                    checked={hasEmergency}
                    onCheckedChange={(checked) => setHasEmergency(checked as boolean)}
                  />
                  <Label htmlFor="hasEmergency" className="cursor-pointer">
                    طوارئ 24 ساعة
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                    تطبيق
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl bg-transparent">
                    مسح
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
            بحث
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد مستشفيات</h2>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
            <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 rounded-full px-8">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{hospitals.length} مستشفى</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <Link key={hospital.id} href={`/user/hospitals/${hospital.id}`} className="group">
                  <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                    <div className="relative overflow-hidden bg-gray-100">
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <Image
                          src={
                            hospital.images?.[0] ||
                            hospital.logo ||
                            `/placeholder.svg?height=300&width=400&query=hospital building`
                          }
                          alt={hospital.nameAr}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      {hospital.isFeatured && (
                        <Badge className="absolute top-3 right-3 bg-amber-500 text-white">مميز</Badge>
                      )}
                      {hospital.isActive && (
                        <Badge className="absolute top-12 right-3 bg-emerald-500 text-white">نشط</Badge>
                      )}
                      {hospital.hasEmergency && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white gap-1">
                          <Ambulance className="w-3 h-3" />
                          طوارئ
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {hospital.nameAr}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {hospital.city} - {hospital.area}
                        </span>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.hasICU && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">عناية مركزة</span>
                        )}
                        {hospital.hasPharmacy && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <Pill className="w-3 h-3" /> صيدلية
                          </span>
                        )}
                        {hospital.hasLab && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <FlaskConical className="w-3 h-3" /> معمل
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{hospital.rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">({hospital.reviewsCount})</span>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-lg text-xs">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
