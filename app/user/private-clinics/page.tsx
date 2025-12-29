"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Star, Stethoscope, Clock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"

interface Doctor {
  _id: string
  name: string
  nameAr: string
  specialty: string
  specialtyAr: string
  experienceYears: number
  rating: number
  reviewCount: number
  profileImage?: string
  clinic?: {
    _id: string
    clinicName: string
    clinicNameAr: string
    location: {
      city: string
      cityAr: string
      address: string
      addressAr: string
    }
    price: number
    appointmentDuration: number
    facilities: string[]
    images: string[]
  }
}

const cities = ["القاهرة", "الجيزة", "الإسكندرية", "المنصورة", "طنطا", "الزقازيق"]
const specialties = ["باطنة", "أطفال", "جلدية", "عظام", "قلب", "أنف وأذن", "عيون", "أسنان", "نساء وتوليد"]

export default function PrivateClinicsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [city, setCity] = useState("all")
  const [specialty, setSpecialty] = useState("all")

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (city && city !== "all") params.append("city", city)
      if (specialty && specialty !== "all") params.append("specialty", specialty)

      const res = await fetch(`/api/private-doctors?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchDoctors()
  }

  const handleBooking = (doctorId: string, clinicId: string) => {
    router.push(`/user/private-clinics/${doctorId}/booking?clinicId=${clinicId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <Stethoscope className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-medium">عيادات خاصة</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">العيادات الخاصة</h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">ابحث عن أفضل الأطباء واحجز موعدك مباشرة</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن طبيب أو تخصص..."
                className="pr-10 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="المدينة" />
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

            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl flex-1">
              بحث
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setCity("all")
                setSpecialty("all")
                setTimeout(fetchDoctors, 100)
              }}
              className="rounded-xl"
            >
              مسح
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد نتائج</h2>
            <p className="text-gray-600">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden rounded-2xl"
              >
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-cyan-100">
                  {doctor.profileImage ? (
                    <Image
                      src={doctor.profileImage || "/placeholder.svg"}
                      alt={doctor.nameAr}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Stethoscope className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{doctor.nameAr}</h3>

                  <div className="flex items-center gap-2 text-emerald-600 text-sm mb-3">
                    <Stethoscope className="w-4 h-4" />
                    <span>{doctor.specialtyAr}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.experienceYears} سنة خبرة</span>
                  </div>

                  {doctor.clinic && (
                    <>
                      <div className="flex items-start gap-2 text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {doctor.clinic.location.cityAr} - {doctor.clinic.clinicNameAr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">({doctor.reviewCount})</span>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                          {doctor.clinic.price} ج.م
                        </Badge>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={() => doctor.clinic && handleBooking(doctor._id, doctor.clinic._id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    احجز الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
