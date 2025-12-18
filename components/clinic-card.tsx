"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Shield, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface Clinic {
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
}

interface ClinicCardProps {
  clinic: Clinic
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/user/clinics/${clinic.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={clinic.images?.[0] || `/placeholder.svg?height=200&width=300&query=medical clinic interior`}
            alt={clinic.nameAr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            {clinic.isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-md shadow-sm">
                مميز
              </Badge>
            )}
            {clinic.insuranceAccepted && clinic.insuranceAccepted.length > 0 && (
              <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-md shadow-sm">
                <Shield className="w-3 h-3 ml-1" />
                يقبل التأمين
              </Badge>
            )}
          </div>

          {/* Logo */}
          {clinic.logo && (
            <div className="absolute top-2 left-2 w-10 h-10 rounded-lg bg-white shadow-md overflow-hidden z-10">
              <img
                src={clinic.logo || "/placeholder.svg"}
                alt={clinic.nameAr}
                className="w-full h-full object-contain p-1"
              />
            </div>
          )}

          {/* Info on Image */}
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <h3 className="font-bold text-white text-base line-clamp-1 drop-shadow-md">{clinic.nameAr}</h3>
            <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">
                {clinic.area}، {clinic.city}
              </span>
            </div>
          </div>

          {/* Quick View */}
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 hover:bg-white text-gray-900 rounded-full px-4 shadow-lg"
            >
              <Eye className="w-4 h-4 ml-1.5" />
              عرض
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(clinic.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-700">{clinic.rating.toFixed(1)}</span>
          <span className="text-[10px] text-gray-500">({clinic.reviewsCount} تقييم)</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {clinic.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-[10px] px-2 py-0.5 bg-gray-50 border-gray-200">
              {specialty}
            </Badge>
          ))}
          {clinic.specialties.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-gray-50 border-gray-200">
              +{clinic.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/user/clinics/${clinic.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs bg-transparent">
              عرض التفاصيل
            </Button>
          </Link>
          <Link href={`/user/clinics/${clinic.id}/doctors`}>
            <Button size="sm" className="rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              الأطباء
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
