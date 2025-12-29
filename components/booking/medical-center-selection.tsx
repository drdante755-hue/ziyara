"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Star, Search, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Center {
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

interface MedicalCenterSelectionProps {
  selectedCenter: Center | null
  onSelect: (center: Center) => void
}

export function MedicalCenterSelection({ selectedCenter, onSelect }: MedicalCenterSelectionProps) {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/medical-centers?active=true&limit=50")
      const data = await response.json()

      if (data.success) {
        setCenters(data.centers || [])
      }
    } catch (error) {
      console.error("Error fetching medical centers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = centers.filter(
    (c) =>
      c.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر المركز الطبي</h2>
        <p className="text-gray-600">اختر المركز لتظهر العيادات التابعة له</p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن مركز طبي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد مراكز طبية متاحة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((center) => (
            <Card
              key={center._id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedCenter?._id === center._id && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => onSelect(center)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={center.images?.[0] || `/placeholder.svg?height=80&width=80&query=center`}
                      alt={center.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{center.nameAr}</h3>

                    {center.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{center.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({center.reviewsCount || 0} تقييم)</span>
                      </div>
                    )}

                    {(center.city || center.area) && (
                      <div className="flex items-center gap-1 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{[center.city, center.area].filter(Boolean).join("، ")}</span>
                      </div>
                    )}

                    {center.specialties && center.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {center.specialties.slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedCenter?._id === center._id && (
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
