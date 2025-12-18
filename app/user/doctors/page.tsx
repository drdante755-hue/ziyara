"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  UserRound,
  Star,
  Loader2,
  Search,
  SlidersHorizontal,
  Video,
  Home,
  BadgeCheck,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Provider {
  id: string
  name: string
  nameAr: string
  title: string
  titleAr: string
  specialty: string
  specialtyAr: string
  image?: string
  gender: "male" | "female"
  experience: number
  consultationFee: number
  rating: number
  reviewsCount: number
  isVerified: boolean
  availableForHomeVisit: boolean
  availableForOnline: boolean
  workingAt?: { type: string; name: string }[]
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Provider[]>([])
  const [specialties, setSpecialties] = useState<{ id: string; nameAr: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [gender, setGender] = useState("all")
  const [homeVisit, setHomeVisit] = useState(false)
  const [onlineConsult, setOnlineConsult] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchSpecialties()
    fetchDoctors()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const res = await fetch("/api/specialties?active=true")
      const data = await res.json()
      if (data.success) {
        setSpecialties(data.specialties || [])
      }
    } catch (error) {
      console.error("Error fetching specialties:", error)
      setSpecialties([])
    }
  }

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (specialty !== "all") params.append("specialty", specialty)
      if (gender !== "all") params.append("gender", gender)
      if (homeVisit) params.append("homeVisit", "true")
      if (onlineConsult) params.append("online", "true")

      const res = await fetch(`/api/providers?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setDoctors(data.providers || [])
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchDoctors()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSearch("")
    setSpecialty("all")
    setGender("all")
    setHomeVisit(false)
    setOnlineConsult(false)
    setTimeout(fetchDoctors, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4">
          <Link
            href="/user/home"
            className="inline-flex items-center gap-1.5 xs:gap-2 text-white/80 hover:text-white transition-colors min-h-[44px] touch-manipulation"
          >
            <ArrowRight className="w-4 xs:w-5 h-4 xs:h-5" />
            <span className="font-medium text-sm xs:text-base">العودة للصفحة الرئيسية</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 xs:gap-2 bg-white/10 backdrop-blur-sm text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-full mb-4 xs:mb-6">
              <UserRound className="w-3.5 xs:w-4 h-3.5 xs:h-4 text-teal-300" />
              <span className="text-xs xs:text-sm font-medium">أطباء متخصصون</span>
            </div>

            <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold text-white mb-3 xs:mb-4">الأطباء</h1>
            <p className="text-base xs:text-lg text-white/70 mb-6 xs:mb-8 max-w-2xl mx-auto px-4">
              ابحث عن أفضل الأطباء المتخصصين واحجز موعدك بسهولة
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 xs:gap-4 sm:gap-6">
              <div className="flex items-center gap-2 xs:gap-3 bg-white/10 backdrop-blur-sm px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-xl min-w-[120px] xs:min-w-[140px]">
                <UserRound className="w-5 xs:w-6 h-5 xs:h-6 text-teal-300" />
                <div className="text-right">
                  <p className="text-xl xs:text-2xl font-bold text-white">{doctors.length}</p>
                  <p className="text-[10px] xs:text-xs text-white/60">طبيب</p>
                </div>
              </div>
              <div className="flex items-center gap-2 xs:gap-3 bg-white/10 backdrop-blur-sm px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-xl min-w-[120px] xs:min-w-[140px]">
                <Video className="w-5 xs:w-6 h-5 xs:h-6 text-teal-300" />
                <div className="text-right">
                  <p className="text-xl xs:text-2xl font-bold text-white">
                    {doctors.filter((d) => d.availableForOnline).length}
                  </p>
                  <p className="text-[10px] xs:text-xs text-white/60">استشارة أونلاين</p>
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
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-3 xs:p-4 flex gap-2 xs:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 w-4 xs:w-5 h-4 xs:h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الطبيب..."
              className="pr-8 xs:pr-10 rounded-xl border-gray-200 text-sm xs:text-base min-h-[44px] touch-manipulation"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl gap-1.5 xs:gap-2 bg-transparent min-h-[44px] px-3 xs:px-4 touch-manipulation"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden xs:inline text-sm">فلترة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] xs:w-80">
              <SheetHeader>
                <SheetTitle>فلترة النتائج</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>التخصص</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="جميع التخصصات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التخصصات</SelectItem>
                      {specialties.map((s) => (
                        <SelectItem key={s.id} value={s.nameAr}>
                          {s.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الجنس</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="male">طبيب</SelectItem>
                      <SelectItem value="female">طبيبة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>خدمات إضافية</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="homeVisit" checked={homeVisit} onCheckedChange={(c) => setHomeVisit(c as boolean)} />
                    <Label htmlFor="homeVisit" className="cursor-pointer">
                      زيارة منزلية
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="onlineConsult"
                      checked={onlineConsult}
                      onCheckedChange={(c) => setOnlineConsult(c as boolean)}
                    />
                    <Label htmlFor="onlineConsult" className="cursor-pointer">
                      استشارة أونلاين
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSearch} className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-xl">
                    تطبيق
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl bg-transparent">
                    مسح
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            onClick={handleSearch}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl min-h-[44px] px-4 xs:px-6 text-sm xs:text-base touch-manipulation"
          >
            بحث
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserRound className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا يوجد أطباء</h2>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
            <Button onClick={clearFilters} className="bg-teal-600 hover:bg-teal-700 rounded-full px-8">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 xs:mb-8">
              <h2 className="text-xl xs:text-2xl font-bold text-gray-900">{doctors.length} طبيب</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
              {doctors.map((doctor) => (
                <Link key={doctor.id} href={`/user/doctors/${doctor.id}`} className="group">
                  <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={
                              doctor.image ||
                              `/placeholder.svg?height=100&width=100&query=doctor ${doctor.gender || "male"}`
                            }
                            alt={doctor.nameAr || doctor.name || "طبيب"}
                            fill
                            className="object-cover"
                          />
                          {doctor.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                              <BadgeCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors truncate">
                            {doctor.nameAr || doctor.name || "طبيب"}
                          </h3>
                          <p className="text-sm text-teal-600 font-medium mb-1">
                            {doctor.titleAr || doctor.title || ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doctor.specialtyAr || doctor.specialty || "تخصص عام"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {doctor.availableForOnline && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <Video className="w-3 h-3" /> أونلاين
                          </span>
                        )}
                        {doctor.availableForHomeVisit && (
                          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <Home className="w-3 h-3" /> زيارة منزلية
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {doctor.experience ?? 0} سنة خبرة
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{(doctor.rating ?? 0).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">({doctor.reviewsCount ?? 0})</span>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-900">{doctor.consultationFee ?? 0}</p>
                          <p className="text-xs text-gray-500">ج.م / كشف</p>
                        </div>
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
