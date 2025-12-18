"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Video, Home, CheckCircle } from "lucide-react"
import Link from "next/link"

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
  workingAt?: {
    type: string
    name: string
  }[]
}

interface DoctorCardProps {
  doctor: Provider
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const placeholderImage = doctor.gender === "female" ? "/female-doctor-hijab.jpg" : "/male-doctor.png"

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl touch-manipulation">
      <CardContent className="p-3 xs:p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Doctor Image */}
          <div className="relative shrink-0">
            <div className="w-16 xs:w-20 h-16 xs:h-20 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-emerald-100">
              <img src={doctor.image || placeholderImage} alt={doctor.nameAr} className="w-full h-full object-cover" />
            </div>
            {doctor.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                <CheckCircle className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
              </div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1 text-sm xs:text-base">
                  {doctor.titleAr} {doctor.nameAr}
                </h3>
                <span className="text-[9px] xs:text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 xs:px-2 py-0.5 rounded-full inline-block mt-1">
                  {doctor.specialtyAr}
                </span>
              </div>
            </div>

            {/* Rating & Experience */}
            <div className="flex items-center gap-2 xs:gap-3 mt-2">
              <div className="flex items-center gap-0.5 xs:gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 xs:w-3 h-2.5 xs:h-3 ${
                        i < Math.floor(doctor.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] xs:text-xs font-medium text-gray-700">{doctor.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-0.5 xs:gap-1 text-[9px] xs:text-[10px] text-gray-500">
                <Clock className="w-2.5 xs:w-3 h-2.5 xs:h-3" />
                <span>{doctor.experience} سنة</span>
              </div>
            </div>

            {/* Working At */}
            {doctor.workingAt && doctor.workingAt.length > 0 && (
              <div className="flex items-center gap-0.5 xs:gap-1 mt-2 text-[9px] xs:text-[10px] text-gray-500">
                <MapPin className="w-2.5 xs:w-3 h-2.5 xs:h-3" />
                <span className="line-clamp-1">{doctor.workingAt[0].name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="flex items-center gap-1.5 xs:gap-2 mt-2 xs:mt-3">
          {doctor.availableForOnline && (
            <Badge
              variant="outline"
              className="text-[9px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-200 rounded-md"
            >
              <Video className="w-2.5 xs:w-3 h-2.5 xs:h-3 ml-0.5 xs:ml-1" />
              أونلاين
            </Badge>
          )}
          {doctor.availableForHomeVisit && (
            <Badge
              variant="outline"
              className="text-[9px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-200 rounded-md"
            >
              <Home className="w-2.5 xs:w-3 h-2.5 xs:h-3 ml-0.5 xs:ml-1" />
              منزلية
            </Badge>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-3 xs:mt-4 pt-2.5 xs:pt-3 border-t border-gray-100">
          <div>
            <span className="text-base xs:text-lg font-bold text-emerald-600">{doctor.consultationFee}</span>
            <span className="text-[10px] xs:text-xs text-gray-500 mr-1">ج.م / الكشف</span>
          </div>
          <Link href={`/user/doctors/${doctor.id}`}>
            <Button
              size="sm"
              className="rounded-lg text-xs xs:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 xs:px-6 min-h-[44px] touch-manipulation"
            >
              احجز الآن
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
