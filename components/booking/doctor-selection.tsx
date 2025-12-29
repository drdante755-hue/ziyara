"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  _id: string
  name: string
  nameAr: string
  title?: string
  titleAr?: string
  specialty?: string
  specialtyAr?: string
  rating?: number
  reviewCount?: number
  image?: string
  experience?: number
  receptionType?: "open" | "limited"
  receptionCapacity?: number | null
}

interface DoctorSelectionProps {
  clinicId: string | undefined
  serviceId: string | undefined
  selectedDoctor: Doctor | null
  onSelect: (doctor: Doctor) => void
}

export function DoctorSelection({ clinicId, serviceId, selectedDoctor, onSelect }: DoctorSelectionProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [remainingMap, setRemainingMap] = useState<Record<string, number | null>>({})

  useEffect(() => {
    if (clinicId) {
      fetchDoctors()
    } else {
      setDoctors([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, serviceId])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/providers?clinicId=${clinicId}&limit=200`)
      const data = await res.json()
      const providers = data?.providers || []

      // serviceId is composed like `${name}-${idx}` in ServiceSelection; extract the original service name
      const serviceName = serviceId ? String(serviceId).split("-")[0] : null

      const filtered = providers.filter((p: any) => {
        if (!serviceName) return true
        const specialtyMatch = p.specialty === serviceName || p.specialtyAr === serviceName
        const subMatch = Array.isArray(p.subSpecialties) && p.subSpecialties.includes(serviceName)
        const partial = (p.specialty || "").toLowerCase().includes(String(serviceName).toLowerCase())
        return specialtyMatch || subMatch || partial
      })

      const mapped: Doctor[] = filtered.map((p: any) => ({
        _id: p.id || p._id || String(p._id),
        name: p.name || "",
        nameAr: p.nameAr || p.name || "",
        title: p.title || "",
        titleAr: p.titleAr || p.title || "",
        specialty: p.specialty || "",
        specialtyAr: p.specialtyAr || "",
        rating: typeof p.rating === "number" ? p.rating : undefined,
        reviewCount: p.reviewsCount || p.reviewCount || 0,
        image: p.image,
        experience: p.experience || 0,
        receptionType: p.receptionType || "open",
        receptionCapacity: typeof p.receptionCapacity === "number" ? p.receptionCapacity : null,
      }))

      setDoctors(mapped)
      // fetch remaining capacities for limited providers (use today's date)
      const limited = mapped.filter((d) => d.receptionType === "limited" && d.receptionCapacity && d.receptionCapacity > 0)
      if (limited.length > 0) {
        const map: Record<string, number | null> = {}
        await Promise.all(
          limited.map(async (d) => {
            try {
              const res = await fetch(`/api/providers/${d._id}/capacity`)
              const data = await res.json()
              if (data?.success) map[d._id] = typeof data.remaining === "number" ? data.remaining : null
              else map[d._id] = null
            } catch (e) {
              map[d._id] = null
            }
          }),
        )
        setRemainingMap(map)
      } else {
        setRemainingMap({})
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر الطبيب</h2>
        <p className="text-gray-600">اختر الطبيب المناسب لك من القائمة</p>
      </div>

      {doctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">لا يوجد أطباء متاحين</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <Card
              key={doctor._id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedDoctor?._id === doctor._id && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => onSelect(doctor)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Doctor Photo */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={doctor.image || `/placeholder.svg?height=80&width=80&query=doctor`}
                      alt={doctor.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {doctor.titleAr} {doctor.nameAr}
                    </h3>

                    {doctor.specialtyAr && <p className="text-emerald-600 font-medium mb-2">{doctor.specialtyAr}</p>}
                    {/* Reception capacity badge */}
                    {doctor.receptionType === "open" ? (
                      <Badge className="text-xs bg-emerald-50 text-emerald-700">مفتوح</Badge>
                    ) : (
                      <div className="mt-2">
                        {remainingMap[doctor._id] === undefined || remainingMap[doctor._id] === null ? (
                          <Badge className="text-xs bg-gray-50 text-gray-700">السعة: {doctor.receptionCapacity ?? '-'}</Badge>
                        ) : remainingMap[doctor._id] <= 0 ? (
                          <Badge className="text-xs bg-red-50 text-red-700">مكتمل — السعة: {doctor.receptionCapacity ?? '-'}</Badge>
                        ) : (
                          <Badge className="text-xs bg-emerald-50 text-emerald-700">متبقي {remainingMap[doctor._id]} من {doctor.receptionCapacity}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      {/* Rating */}
                      {doctor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{doctor.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({doctor.reviewCount})</span>
                        </div>
                      )}

                      {/* Experience */}
                      {doctor.experience && (
                        <Badge variant="secondary" className="text-xs">
                          خبرة {doctor.experience} سنة
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedDoctor?._id === doctor._id && (
                    <div className="shrink-0">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
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
