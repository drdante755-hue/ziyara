"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Video,
  Home,
  CheckCircle,
  GraduationCap,
  Calendar,
  Loader2,
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
      const data = await res.json()
      if (data.success) {
        setDoctor(data.provider)
      }
    } catch (error) {
      console.error("Error fetching doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?providerId=${id}&limit=5`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">الطبيب غير موجود</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  const placeholderImage = doctor.gender === "female" ? "/female-doctor-hijab.jpg" : "/male-doctor.png"

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">الملف الشخصي</h1>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="px-4 -mt-0">
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={doctor.image || placeholderImage}
                    alt={doctor.nameAr}
                    className="w-full h-full object-cover"
                  />
                </div>
                {doctor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {doctor.titleAr} {doctor.nameAr}
                </h2>
                <p className="text-primary font-medium">{doctor.specialtyAr}</p>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
                    <span>({doctor.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{doctor.experience} سنة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-2 mt-4">
              {doctor.availableForOnline && (
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  <Video className="w-3 h-3 ml-1" />
                  أونلاين - {doctor.onlineConsultationFee} ج.م
                </Badge>
              )}
              {doctor.availableForHomeVisit && (
                <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <Home className="w-3 h-3 ml-1" />
                  زيارة منزلية - {doctor.homeVisitFee} ج.م
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="mt-4 px-4">
        <TabsList className="w-full">
          <TabsTrigger value="about" className="flex-1">
            عن الطبيب
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">
            التقييمات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4 space-y-4">
          {/* Bio */}
          {doctor.bioAr && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">نبذة</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{doctor.bioAr}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {doctor.education && doctor.education.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  المؤهلات العلمية
                </h3>
                <div className="space-y-3">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-muted-foreground">
                        {edu.institution} - {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Working At */}
          {doctor.workingAt && doctor.workingAt.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  أماكن العمل
                </h3>
                <div className="space-y-2">
                  {doctor.workingAt.map((place, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{place.type === "clinic" ? "عيادة" : "مستشفى"}</Badge>
                      <span>{place.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {doctor.languages && doctor.languages.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">اللغات</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, index) => (
                    <Badge key={index} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد تقييمات بعد</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-primary">{doctor.consultationFee}</span>
            <span className="text-muted-foreground mr-1">ج.م / الكشف</span>
          </div>
          {doctor.followUpFee && (
            <span className="text-sm text-muted-foreground">المتابعة: {doctor.followUpFee} ج.م</span>
          )}
        </div>
        <Link href={`/user/book/${doctor.id}`}>
          <Button className="w-full" size="lg">
            <Calendar className="w-5 h-5 ml-2" />
            احجز موعد
          </Button>
        </Link>
      </div>
    </div>
  )
}
