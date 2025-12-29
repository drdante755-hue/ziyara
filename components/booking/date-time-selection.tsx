"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlot {
  _id: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface DateTimeSelectionProps {
  doctorId: string | undefined
  clinicId?: string | undefined
  selectedDate: string | null
  selectedTimeSlot: TimeSlot | null
  onSelectDate: (date: string) => void
  onSelectTimeSlot: (slot: TimeSlot) => void
}

export function DateTimeSelection({
  doctorId,
  clinicId,
  selectedDate,
  selectedTimeSlot,
  onSelectDate,
  onSelectTimeSlot,
}: DateTimeSelectionProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (doctorId || clinicId) {
      fetchAvailableDates()
    }
  }, [doctorId, clinicId, currentMonth])

  useEffect(() => {
    if (selectedDate && (doctorId || clinicId)) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate, doctorId, clinicId])

  const fetchAvailableDates = async () => {
    try {
      setLoading(true)
      const dates: string[] = []
      const today = new Date()

      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dates.push(date.toISOString().split("T")[0])
      }

      setAvailableDates(dates)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dates:", error)
      setLoading(false)
    }
  }

  const fetchTimeSlots = async (date: string) => {
    try {
      setLoadingSlots(true)
      const params = new URLSearchParams()
      if (doctorId) params.append("providerId", doctorId)
      if (clinicId) params.append("clinicId", clinicId)
      params.append("date", date)
      params.append("status", "available")

      const res = await fetch(`/api/slots?${params.toString()}`)
      const data = await res.json()

      if (data?.success && data.slots && data.slots.length > 0) {
        const slots = data.slots.map((s: any) => ({
          _id: s.id || s._id,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: s.status === "available",
        }))
        setTimeSlots(slots)
      } else {
        setTimeSlots([])
      }
      setLoadingSlots(false)
    } catch (error) {
      console.error("Error fetching time slots:", error)
      setTimeSlots([])
      setLoadingSlots(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return availableDates.includes(dateStr) && date >= new Date(new Date().setHours(0, 0, 0, 0))
  }

  const formatArabicDate = (date: Date) => {
    return date.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">اختر التاريخ والوقت</h2>
        <p className="text-gray-600">حدد اليوم والوقت المناسب لموعدك</p>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              اختر التاريخ
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {getDaysInMonth().map((date, index) => {
              const dateStr = date.toISOString().split("T")[0]
              const isAvailable = isDateAvailable(date)
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={index}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSelectDate(dateStr)}
                  className={cn(
                    "calendar-day",
                    isAvailable && "calendar-day-available",
                    isSelected && "calendar-day-selected",
                    !isAvailable && "opacity-30 cursor-not-allowed",
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">{formatArabicDate(new Date(selectedDate))}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              اختر الوقت
            </h3>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500">لا توجد مواعيد متاحة في هذا اليوم</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot._id}
                    disabled={!slot.isAvailable}
                    onClick={() => slot.isAvailable && onSelectTimeSlot(slot)}
                    className={cn(
                      "time-slot",
                      slot.isAvailable && "hover:border-primary hover:bg-primary/5",
                      selectedTimeSlot?._id === slot._id && "time-slot-selected",
                      !slot.isAvailable && "opacity-40 cursor-not-allowed bg-gray-100",
                    )}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
