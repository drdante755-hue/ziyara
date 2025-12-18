"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, Search, Edit, X, CheckCircle, AlertCircle, MapPin } from "lucide-react"

// Mock data for appointments
const appointments = [
  {
    id: 1,
    bookingNumber: "APT123456789",
    doctorName: "د. أحمد محمد علي",
    specialty: "الطب الباطني",
    date: "2024-01-20",
    time: "10:00",
    status: "confirmed",
    location: "مستشفى الملك فيصل",
    patientName: "محمد أحمد",
    phone: "0501234567",
    price: 200,
    notes: "ألم في المعدة",
  },
  {
    id: 2,
    bookingNumber: "APT987654321",
    doctorName: "د. فاطمة السعيد",
    specialty: "طب الأطفال",
    date: "2024-01-25",
    time: "14:30",
    status: "pending",
    location: "مستشفى الملك عبدالعزيز",
    patientName: "سارة محمد",
    phone: "0507654321",
    price: 180,
    notes: "فحص دوري",
  },
  {
    id: 3,
    bookingNumber: "APT456789123",
    doctorName: "د. محمد الأحمد",
    specialty: "طب العظام",
    date: "2024-01-15",
    time: "16:00",
    status: "completed",
    location: "مستشفى الملك خالد",
    patientName: "علي حسن",
    phone: "0509876543",
    price: 250,
    notes: "ألم في الركبة",
  },
  {
    id: 4,
    bookingNumber: "APT789123456",
    doctorName: "د. نورا العتيبي",
    specialty: "طب النساء والتوليد",
    date: "2024-01-12",
    time: "11:00",
    status: "cancelled",
    location: "مستشفى الملك فهد",
    patientName: "مريم أحمد",
    phone: "0502345678",
    price: 220,
    notes: "متابعة حمل",
  },
]

const statusConfig = {
  confirmed: { label: "مؤكد", color: "bg-green-100 text-green-800", icon: CheckCircle },
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  completed: { label: "مكتمل", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: X },
}

export default function MyAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const IconComponent = config.icon
    return <IconComponent className="w-4 h-4" />
  }

  const handleCancelAppointment = (appointmentId: number) => {
    // Handle appointment cancellation
    console.log("Cancel appointment:", appointmentId)
  }

  const handleRescheduleAppointment = (appointmentId: number) => {
    // Handle appointment rescheduling
    console.log("Reschedule appointment:", appointmentId)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">حجوزاتي</h1>
          <p className="text-muted-foreground">إدارة ومتابعة مواعيدك الطبية</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث برقم الحجز، اسم الطبيب، أو اسم المريض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              size="sm"
            >
              الكل
            </Button>
            <Button
              variant={selectedStatus === "confirmed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("confirmed")}
              size="sm"
            >
              مؤكد
            </Button>
            <Button
              variant={selectedStatus === "pending" ? "default" : "outline"}
              onClick={() => setSelectedStatus("pending")}
              size="sm"
            >
              قيد المراجعة
            </Button>
            <Button
              variant={selectedStatus === "completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("completed")}
              size="sm"
            >
              مكتمل
            </Button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مواعيد</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "لم يتم العثور على مواعيد تطابق البحث" : "لم تقم بحجز أي مواعيد بعد"}
                </p>
                <Button>حج�� موعد جديد</Button>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Appointment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={statusConfig[appointment.status as keyof typeof statusConfig].color}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            {statusConfig[appointment.status as keyof typeof statusConfig].label}
                          </div>
                        </Badge>
                        <span className="text-sm text-muted-foreground">رقم الحجز: {appointment.bookingNumber}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{appointment.doctorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{appointment.specialty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.location}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-muted-foreground">المريض: </span>
                            <span className="font-medium">{appointment.patientName}</span>
                          </div>
                          <div className="text-lg font-semibold text-primary">{appointment.price} ريال</div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">الملاحظات: </span>
                            <span className="text-sm">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {appointment.status === "confirmed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            تعديل
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </Button>
                        </>
                      )}
                      {appointment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          إلغاء
                        </Button>
                      )}
                      {appointment.status === "completed" && (
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                          <Calendar className="w-4 h-4" />
                          إعادة حجز
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Search by Booking Number */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>البحث السريع برقم الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input placeholder="أدخل رقم الحجز..." className="flex-1" />
              <Button>بحث</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              يمكنك البحث عن حجزك باستخدام رقم الحجز حتى لو لم تكن مسجلاً في الموقع
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
