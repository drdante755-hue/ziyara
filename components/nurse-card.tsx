import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, UserCheck, CalendarCheck } from "lucide-react"

interface NurseCardProps {
  nurse: {
    id: string
    name: string
    experience: number
    location: string
    rating: number
    reviews: number
    avatar: string
    specialties: string[]
    completedTasks: number
    isAvailable: boolean
    isVerified: boolean
  }
}

export function NurseCard({ nurse }: NurseCardProps) {
  const availabilityColor = nurse.isAvailable
    ? "bg-green-500"
    : nurse.completedTasks % 2 === 0 // Example for 'busy' state
      ? "bg-yellow-500"
      : "bg-gray-500"
  const availabilityText = nurse.isAvailable ? "متاح الآن" : nurse.completedTasks % 2 === 0 ? "مشغول حالياً" : "غير متاح"

  return (
    <Card className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-emerald-400">
              <AvatarImage src={nurse.avatar || "/placeholder.svg"} alt={nurse.name} />
              <AvatarFallback>{nurse.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {nurse.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 text-right">
            <h3 className="text-xl font-bold text-gray-900">{nurse.name}</h3>
            <p className="text-sm text-gray-600">خبرة: {nurse.experience} سنوات</p>
            <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>{nurse.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">({nurse.reviews})</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(nurse.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{nurse.rating}</span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {nurse.specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="bg-emerald-50 text-emerald-700">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Badge className={`${availabilityColor} text-white`}>{availabilityText}</Badge>
          </div>
          <span>
            مهام مكتملة: <span className="font-semibold">{nurse.completedTasks}</span>
          </span>
        </div>

        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white mt-4">
          <CalendarCheck className="w-4 h-4 ml-2" />
          احجز الآن
        </Button>
      </CardContent>
    </Card>
  )
}
