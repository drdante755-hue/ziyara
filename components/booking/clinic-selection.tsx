"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Star, Search, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Clinic {
  _id: string
  name: string
  nameAr: string
  city?: string
  area?: string
  address?: string
  rating?: number
  reviewsCount?: number
  specialties?: string[]
  images?: string[]
}

interface ClinicSelectionProps {
  selectedClinic: Clinic | null
  onSelect: (clinic: Clinic) => void
  medicalCenterId?: string | null
}

export function ClinicSelection({ selectedClinic, onSelect, medicalCenterId }: ClinicSelectionProps) {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchClinics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalCenterId])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      const base = "/api/clinics?active=true&limit=50"
      const url = medicalCenterId ? `${base}&medicalCenterId=${medicalCenterId}` : base
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setClinics(data.clinics || [])
      }
    } catch (error) {
      console.error("Error fetching clinics:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر العيادة أو المركز الطبي</h2>
        <p className="text-gray-600">ابحث واختر المركز الطبي المناسب لك</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن عيادة أو مركز طبي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Clinics Grid */}
      {filteredClinics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد عيادات متاحة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClinics.map((clinic) => (
            <Card
              key={clinic._id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedClinic?._id === clinic._id && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => onSelect(clinic)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={clinic.images?.[0] || `/placeholder.svg?height=80&width=80&query=clinic`}
                      alt={clinic.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{clinic.nameAr}</h3>

                    {/* Rating */}
                    {clinic.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{clinic.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({clinic.reviewsCount || 0} تقييم)</span>
                      </div>
                    )}

                    {/* Location */}
                    {(clinic.city || clinic.area) && (
                      <div className="flex items-center gap-1 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{[clinic.city, clinic.area].filter(Boolean).join("، ")}</span>
                      </div>
                    )}

                    {/* Specialties */}
                    {clinic.specialties && clinic.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {clinic.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {clinic.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{clinic.specialties.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {selectedClinic?._id === clinic._id && (
                    <div className="shrink-0">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
