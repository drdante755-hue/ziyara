"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Video, Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  bookingNumber: string
  provider: {
    id: string
    nameAr: string
    specialtyAr: string
    image?: string
  }
  clinic?: { nameAr: string; address: string }
  hospital?: { nameAr: string; address: string }
  date: string
  startTime: string
  type: "clinic" | "hospital" | "online" | "home"
  totalPrice: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
}

const statusMap: { [key: string]: { label: string; color: string } } = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  cancelled: { label: "ملغى", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
}

const typeMap: { [key: string]: { label: string; icon: React.ReactNode } } = {
  clinic: { label: "في العيادة", icon: <MapPin className="w-4 h-4" /> },
  hospital: { label: "في المستشفى", icon: <MapPin className="w-4 h-4" /> },
  online: { label: "أونلاين", icon: <Video className="w-4 h-4" /> },
  home: { label: "زيارة منزلية", icon: <MapPin className="w-4 h-4" /> },
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchBookings()
    }
  }, [status])

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings")
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter((b) => ["pending", "confirmed"].includes(b.status))
  const pastBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status))

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Link href={`/user/bookings/${booking.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted">
              <img
                src={booking.provider?.image || `/placeholder.svg?height=56&width=56&query=doctor`}
                alt={booking.provider?.nameAr || "طبيب"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold line-clamp-1">{booking.provider?.nameAr || "طبيب غير محدد"}</h3>
                  <p className="text-sm text-muted-foreground">{booking.provider?.specialtyAr || "تخصص غير محدد"}</p>
                </div>
                <Badge className={statusMap[booking.status]?.color || "bg-gray-100 text-gray-700"}>
                  {statusMap[booking.status]?.label || booking.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : "تاريخ غير محدد"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{booking.startTime || "--:--"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {typeMap[booking.type]?.icon || <MapPin className="w-4 h-4" />}
                  <span>{typeMap[booking.type]?.label || booking.type}</span>
                </div>
              </div>
            </div>

            <ChevronLeft className="w-5 h-5 text-muted-foreground self-center" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">حجوزاتي</h1>
            <p className="text-primary-foreground/80">إدارة مواعيدك الطبية</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            القادمة ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            السابقة ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">لا توجد حجوزات قادمة</p>
              <Link href="/user/doctors">
                <Button>احجز موعد الآن</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastBookings.length > 0 ? (
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد حجوزات سابقة</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
