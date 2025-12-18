import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AvailabilitySlot from "@/models/AvailabilitySlot"
import Provider from "@/models/Provider"

// POST - إنشاء مواعيد تلقائياً لفترة زمنية
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      providerId,
      clinicId,
      hospitalId,
      startDate,
      endDate,
      workingDays, // مثل ["sunday", "monday", "tuesday", ...]
      startTime, // "09:00"
      endTime, // "17:00"
      slotDuration, // 30 دقيقة
      breakStart, // "12:00" (اختياري)
      breakEnd, // "13:00" (اختياري)
      type,
    } = body

    if (!providerId || !startDate || !endDate || !workingDays || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    const provider = await Provider.findById(providerId)
    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const workingDayNumbers = workingDays.map((day: string) => dayMap[day.toLowerCase()])
    const duration = slotDuration || 30

    const getPrice = (slotType: string) => {
      switch (slotType) {
        case "online":
          return provider.onlineConsultationFee || provider.consultationFee
        case "home":
          return provider.homeVisitFee || provider.consultationFee
        default:
          return provider.consultationFee
      }
    }

    const createdSlots = []
    const currentDate = new Date(startDate)
    const finalDate = new Date(endDate)

    while (currentDate <= finalDate) {
      if (workingDayNumbers.includes(currentDate.getDay())) {
        // إنشاء فترات لهذا اليوم
        const [startHour, startMin] = startTime.split(":").map(Number)
        const [endHour, endMin] = endTime.split(":").map(Number)
        const [breakStartHour, breakStartMin] = breakStart ? breakStart.split(":").map(Number) : [0, 0]
        const [breakEndHour, breakEndMin] = breakEnd ? breakEnd.split(":").map(Number) : [0, 0]

        let currentHour = startHour
        let currentMin = startMin

        while (currentHour * 60 + currentMin + duration <= endHour * 60 + endMin) {
          const slotStart = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`

          // حساب وقت النهاية
          let endSlotMin = currentMin + duration
          let endSlotHour = currentHour
          if (endSlotMin >= 60) {
            endSlotHour += Math.floor(endSlotMin / 60)
            endSlotMin = endSlotMin % 60
          }
          const slotEnd = `${String(endSlotHour).padStart(2, "0")}:${String(endSlotMin).padStart(2, "0")}`

          // تخطي فترة الراحة
          const slotStartMinutes = currentHour * 60 + currentMin
          const breakStartMinutes = breakStartHour * 60 + breakStartMin
          const breakEndMinutes = breakEndHour * 60 + breakEndMin

          if (!breakStart || slotStartMinutes < breakStartMinutes || slotStartMinutes >= breakEndMinutes) {
            // التحقق من عدم وجود موعد مكرر
            const existingSlot = await AvailabilitySlot.findOne({
              providerId,
              date: new Date(currentDate),
              startTime: slotStart,
            })

            if (!existingSlot) {
              const newSlot = await AvailabilitySlot.create({
                providerId,
                clinicId,
                hospitalId,
                date: new Date(currentDate),
                startTime: slotStart,
                endTime: slotEnd,
                duration,
                type: type || "clinic",
                status: "available",
                price: getPrice(type || "clinic"),
              })
              createdSlots.push(newSlot)
            }
          }

          // الانتقال للفترة التالية
          currentMin += duration
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60)
            currentMin = currentMin % 60
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      success: true,
      message: `تم إنشاء ${createdSlots.length} موعد بنجاح`,
      totalSlots: createdSlots.length,
    })
  } catch (error) {
    console.error("Error generating slots:", error)
    return NextResponse.json({ success: false, error: "فشل في إنشاء المواعيد" }, { status: 500 })
  }
}
