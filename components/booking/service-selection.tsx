"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, AlertCircle, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface Service {
  _id: string
  name: string
  nameAr: string
  price: number
  duration?: number
  description?: string
}

interface ServiceSelectionProps {
  clinicId: string | undefined
  selectedService: Service | null
  onSelect: (service: Service) => void
}

export function ServiceSelection({ clinicId, selectedService, onSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [specialties, setSpecialties] = useState<string[]>([])

  useEffect(() => {
    if (clinicId) {
      fetchServices()
    } else {
      setServices([])
      setSpecialties([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId])

  useEffect(() => {
    if (!clinicId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/clinics/${clinicId}`)
        const data = await res.json()
        if (data?.success && data?.clinic?.specialties) {
          setSpecialties(data.clinic.specialties || [])
        } else if (data?.specialties) {
          setSpecialties(data.specialties || [])
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [clinicId])

  const fetchServices = async () => {
    try {
      setLoading(true)

      const providersRes = await fetch(`/api/providers?clinicId=${clinicId}&limit=100`)
      const provData = await providersRes.json()
      const providers = provData?.providers || []

      const map: Record<string, { nameAr?: string; prices: number[] }> = {}
      providers.forEach((p: any) => {
        const key = p.specialty || p.specialtyAr || "عام"
        const nameAr = p.specialtyAr || p.specialty || p.nameAr || p.name
        if (!map[key]) map[key] = { nameAr, prices: [] }
        if (typeof p.consultationFee === "number") map[key].prices.push(p.consultationFee)

        if (Array.isArray(p.subSpecialties)) {
          p.subSpecialties.forEach((sub: string) => {
            const subKey = sub
            if (!map[subKey]) map[subKey] = { nameAr: sub, prices: [] }
          })
        }
      })

      const realServices: Service[] = Object.keys(map).map((k, idx) => {
        const entry = map[k]
        const avg = entry.prices.length
          ? Math.round(entry.prices.reduce((a, b) => a + b, 0) / entry.prices.length)
          : 0
        return {
          _id: `${k}-${idx}`,
          name: k,
          nameAr: entry.nameAr || k,
          price: avg || 0,
          duration: 30,
          description: "",
        }
      })

      setServices(realServices)
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر الخدمة</h2>
        <p className="text-gray-600">حدد نوع الخدمة الطبية المطلوبة</p>
      </div>

      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {specialties.map((s, i) => (
            <Badge key={i} className="text-sm bg-emerald-50 text-emerald-700">
              {s}
            </Badge>
          ))}
        </div>
      )}

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد خدمات متاحة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <Card
              key={service._id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedService?._id === service._id && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => onSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        selectedService?._id === service._id
                          ? "bg-primary text-white"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      <Stethoscope className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{service.nameAr}</h3>
                      {service.description && <p className="text-sm text-gray-600 mb-2">{service.description}</p>}

                      <div className="flex items-center gap-3 text-sm">
                        {service.duration && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} دقيقة</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <span>{service.price} جنيه</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedService?._id === service._id && (
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
