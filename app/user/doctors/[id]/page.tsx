"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Video,
  Home,
  GraduationCap,
  Calendar,
  Users,
  Shield,
  Award,
  Languages,
} from "lucide-react"
import Link from "next/link"

interface Provider {
  id: string
  name: string
  nameAr: string
  title: string
  titleAr: string
  specialty: string
  specialtyAr: string
  bio?: string
  bioAr?: string
  image?: string
  gender: "male" | "female"
  languages: string[]
  education: { degree: string; institution: string; year: number }[]
  experience: number
  consultationFee: number
  followUpFee?: number
  rating: number
  reviewsCount: number
  totalPatients: number
  isVerified: boolean
  availableForHomeVisit: boolean
  homeVisitFee?: number
  availableForOnline: boolean
  onlineConsultationFee?: number
  workingAt?: { type: string; id: string; name: string }[]
}

interface Review {
  id: string
  user: { name: string }
  rating: number
  comment?: string
  createdAt: string
}

function DoctorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="flex gap-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [doctor, setDoctor] = useState<Provider | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctor()
    fetchReviews()
  }, [id])

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/providers/${id}`)
      const contentType = res.headers.get("content-type") || ""
      if (!res.ok) {
        const text = await res.text()
        console.error("Error fetching doctor, server returned:", text)
        return
      }
      if (!contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Expected JSON from /api/providers but received:", text)
        return
      }
      const data = await res.json()
      if (data.success) {
        setDoctor(data.provider)
      } else {
        console.error("Provider API returned error:", data)
      }
    } catch (error) {
      console.error("Error fetching doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const url = `/api/reviews?providerId=${id}&limit=5`
      const res = await fetch(url)
      const contentType = res.headers.get("content-type") || ""
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const err = await res.json()
          console.error("Reviews API returned error:", err)
        } else {
          console.error(`Error fetching reviews: ${res.status} ${res.statusText} for ${url}`)
        }
        return
      }

      if (!contentType.includes("application/json")) {
        console.warn(`Expected JSON from ${url} but got '${contentType}'. Skipping reviews.`)
        return
      }

      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
      } else {
        console.error("Reviews API returned error:", data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  if (loading) {
    return <DoctorProfileSkeleton />
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">الطبيب غير موجود</h2>
          <p className="text-sm text-muted-foreground mb-6">لم نتمكن من العثور على معلومات هذا الطبيب</p>
          <Button onClick={() => router.back()} size="lg" variant="outline">
            العودة للقائمة
          </Button>
        </div>
      </div>
    )
  }

  const placeholderImage = doctor.gender === "female" ? "/female-doctor-hijab.jpg" : "/male-doctor.png"

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Doctor Profile Header */}
        <div className="flex gap-6 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-xl">
              <img src={doctor.image || placeholderImage} alt={doctor.nameAr} className="w-full h-full object-cover" />
            </div>
            {doctor.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-lg border-4 border-background">
                <Shield className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {doctor.titleAr} {doctor.nameAr}
            </h1>
            <p className="text-lg text-muted-foreground mb-3">{doctor.specialtyAr}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({doctor.reviewsCount})</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience} سنة</span>
              </div>
            </div>

            {doctor.totalPatients > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{doctor.totalPatients}+ مريض</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Options */}
        {(doctor.availableForOnline || doctor.availableForHomeVisit) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {doctor.availableForOnline && (
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">كشف أونلاين</p>
                      <p className="text-lg font-bold text-primary">{doctor.onlineConsultationFee} ج.م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {doctor.availableForHomeVisit && (
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">زيارة منزلية</p>
                      <p className="text-lg font-bold text-primary">{doctor.homeVisitFee} ج.م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Education */}
        {doctor.education && doctor.education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              المؤهلات
            </h2>
            <div className="space-y-3">
              {doctor.education.map((edu, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="font-semibold mb-1">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution} • {edu.year}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Work Locations */}
        {doctor.workingAt && doctor.workingAt.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              أماكن العمل
            </h2>
            <div className="space-y-3">
              {doctor.workingAt.map((place, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{place.type === "clinic" ? "عيادة" : "مستشفى"}</Badge>
                      <span className="font-medium">{place.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {doctor.languages && doctor.languages.length > 0 && (
          <section className="mb-6">
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((lang, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2 text-sm">
                  {lang}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            التقييمات ({doctor.reviewsCount})
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {review.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Fixed Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">سعر الكشف</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{doctor.consultationFee}</span>
              <span className="text-sm text-muted-foreground">ج.م</span>
            </div>
          </div>
          <Link href={`/user/book/${doctor.id}`} className="flex-1">
            <Button size="lg" className="w-full">
              <Calendar className="w-5 h-5 ml-2" />
              احجز موعد
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
