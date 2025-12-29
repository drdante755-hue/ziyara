import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import PrivateAppointment from "@/models/PrivateAppointment"
import DoctorSchedule from "@/models/DoctorSchedule"
import PrivateClinic from "@/models/PrivateClinic"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { doctorId, clinicId, date, time, patient, symptoms, notes, paymentMethod, userId } = body

    // Validate required fields
    if (!doctorId || !clinicId || !date || !time || !patient?.name || !patient?.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "جميع الحقول المطلوبة مطلوبة",
        },
        { status: 400 },
      )
    }

    // Get clinic to get price
    const clinic = await PrivateClinic.findById(clinicId).lean()
    if (!clinic) {
      return NextResponse.json(
        {
          success: false,
          message: "العيادة غير موجودة",
        },
        { status: 404 },
      )
    }

    // Check if date is valid
    const schedule = await DoctorSchedule.findOne({ doctorId }).lean()
    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد جدول متاح لهذا الطبيب",
        },
        { status: 404 },
      )
    }

    // Check if date is in vacation
    if (schedule.vacationDates.includes(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "الطبيب في إجازة في هذا اليوم",
        },
        { status: 400 },
      )
    }

    // Check if time slot is available
    if (!schedule.timeSlots.includes(time)) {
      return NextResponse.json(
        {
          success: false,
          message: "الوقت المحدد غير متاح",
        },
        { status: 400 },
      )
    }

    // Check if slot is not fully booked
    const existingBookings = await PrivateAppointment.countDocuments({
      doctorId,
      date,
      time,
      status: { $in: ["confirmed", "completed"] },
    })

    if (existingBookings >= schedule.maxPatientsPerSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الموعد محجوز بالكامل",
        },
        { status: 400 },
      )
    }

    // Create appointment
    const appointment = await PrivateAppointment.create({
      doctorId,
      clinicId,
      userId,
      date,
      time,
      patient,
      symptoms,
      notes,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentMethod === "online" ? "pending" : "pending",
      amount: clinic.price,
      status: "confirmed",
    })

    return NextResponse.json({
      success: true,
      message: "تم حجز الموعد بنجاح",
      appointment,
    })
  } catch (error: any) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حجز الموعد",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف المستخدم مطلوب",
        },
        { status: 400 },
      )
    }

    const appointments = await PrivateAppointment.find({ userId })
      .populate("doctorId")
      .populate("clinicId")
      .sort({ date: -1, time: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      appointments,
    })
  } catch (error: any) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المواعيد",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
