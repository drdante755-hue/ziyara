"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ArrowRight, Hospital, MapPin, Star, Loader2, Search, SlidersHorizontal, Shield, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import ClinicDetailsModal from "@/components/clinic-details-modal"
import { useRouter } from "next/navigation"

interface MedicalCenter {
  id: string
  name: string
  nameAr: string
  address: string
  city: string
  area: string
  phone: string
  images: string[]
  logo?: string
  specialties: string[]
  rating: number
  reviewsCount: number
  isFeatured: boolean
  insuranceAccepted?: string[]
  clinicType: "medical_center" | "private_clinic"
}

const cities = ["القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "طنطا", "الزقازيق"]

export default function MedicalCentersPage() {
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<MedicalCenter | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMedicalCenters()
  }, [])

  const fetchMedicalCenters = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (city && city !== "all") params.append("city", city)

      const res = await fetch(`/api/medical-centers?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        const centers = data.centers || []
        setMedicalCenters(centers)
      }
    } catch (error) {
      console.error("Error fetching medical centers:", error)
      setMedicalCenters([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchMedicalCenters()
    setFiltersOpen(false)
  }

  const clearFilters = () => {
    setSearch("")
    setCity("all")
    setTimeout(() => {
      fetchMedicalCenters()
    }, 100)
  }

  const handleViewDetails = (center: MedicalCenter, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCenter(center)
    setIsDetailsModalOpen(true)
  }

  const handleBookAppointment = (centerId: string) => {
    // pass medicalCenterId so booking page can differentiate centers vs clinics
    router.push(`/user/book-appointment?medicalCenterId=${centerId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <Hospital className="w-4 h-4 text-teal-300" />
              <span className="text-sm font-medium">مراكز طبية متخصصة</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">المراكز الطبية المتخصصة</h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              اكتشف أفضل المراكز الطبية المتخصصة في منطقتك واحجز موعدك مع فريق من الأطباء المتخصصين
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Hospital className="w-6 h-6 text-teal-300" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{medicalCenters.length}</p>
                  <p className="text-xs text-white/60">مركز طبي</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Shield className="w-6 h-6 text-teal-300" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{medicalCenters.filter((c) => c.isFeatured).length}</p>
                  <p className="text-xs text-white/60">مركز مميز</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Users className="w-6 h-6 text-teal-300" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {medicalCenters.reduce((acc, c) => acc + (c.specialties?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-white/60">تخصص متاح</p>
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
              placeholder="ابحث عن مركز طبي..."
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
          <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 rounded-xl">
            بحث
          </Button>
        </div>
      </div>

      {/* Medical Centers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : medicalCenters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalCenters.map((center) => (
              <div key={center.id} className="group cursor-pointer" onClick={(e) => handleViewDetails(center, e)}>
                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl">
                  <div className="relative overflow-hidden bg-gray-100">
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image
                        src={
                          center.images?.[0] ||
                          center.logo ||
                          `/placeholder.svg?height=300&width=400&query=medical center` ||
                          "/placeholder.svg"
                        }
                        alt={center.nameAr || center.name || "مركز طبي"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {center.isFeatured && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">مميز</Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <Hospital className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                        {center.nameAr || center.name || "مركز طبي"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{[center.city, center.area].filter(Boolean).join(" - ") || "موقع غير محدد"}</span>
                    </div>

                    {Array.isArray(center.specialties) && center.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {center.specialties.slice(0, 3).map((spec, i) => (
                          <span key={i} className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
                            {spec}
                          </span>
                        ))}
                        {center.specialties.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{center.specialties.length - 3} المزيد
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{(center.rating ?? 0).toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({center.reviewsCount ?? 0})</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 rounded-lg text-xs"
                        onClick={(e) => handleViewDetails(center, e)}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hospital className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد مراكز طبية</h2>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث للعثور على مراكز طبية في منطقتك</p>
            <Button onClick={clearFilters} className="bg-teal-600 hover:bg-teal-700 rounded-full px-8">
              مسح الفلاتر
            </Button>
          </div>
        )}
      </div>

      {/* Center Details Modal */}
      {selectedCenter && (
        <ClinicDetailsModal
          clinic={selectedCenter}
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedCenter(null)
          }}
          onBookAppointment={handleBookAppointment}
        />
      )}
    </div>
  )
}
