import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import DoctorSchedule from "@/models/DoctorSchedule"
import PrivateAppointment from "@/models/PrivateAppointment"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const doctorId = params.id
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date") // "2025-01-15"

    // Get doctor schedule
    const schedule = await DoctorSchedule.findOne({
      doctorId,
      isActive: true,
    }).lean()

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد جدول متاح لهذا الطبيب",
        },
        { status: 404 },
      )
    }

    // If date is provided, get available slots for that date
    if (date) {
      // Check if date is in vacation dates
      if (schedule.vacationDates.includes(date)) {
        return NextResponse.json({
          success: true,
          schedule,
          availableSlots: [],
          message: "الطبيب في إجازة في هذا اليوم",
        })
      }

      // Check if date is a working day
      const dateObj = new Date(date)
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      const dayName = dayNames[dateObj.getDay()]

      if (!schedule.workingDays.includes(dayName as any)) {
        return NextResponse.json({
          success: true,
          schedule,
          availableSlots: [],
          message: "الطبيب لا يعمل في هذا اليوم",
        })
      }

      // Get booked appointments for this date
      const bookedAppointments = await PrivateAppointment.find({
        doctorId,
        date,
        status: { $in: ["confirmed", "completed"] },
      }).lean()

      // Count bookings per time slot
      const bookingsCount: { [key: string]: number } = {}
      bookedAppointments.forEach((appointment) => {
        bookingsCount[appointment.time] = (bookingsCount[appointment.time] || 0) + 1
      })

      // Filter available slots
      const availableSlots = schedule.timeSlots
        .filter((slot) => {
          const count = bookingsCount[slot] || 0
          return count < schedule.maxPatientsPerSlot
        })
        .map((slot) => ({
          time: slot,
          available: true,
          bookedCount: bookingsCount[slot] || 0,
          maxPatients: schedule.maxPatientsPerSlot,
        }))

      return NextResponse.json({
        success: true,
        schedule,
        availableSlots,
      })
    }

    // Return schedule without availability info
    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error: any) {
    console.error("Error fetching doctor schedule:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الجدول",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
