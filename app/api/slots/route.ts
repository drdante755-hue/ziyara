import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AvailabilitySlot from "@/models/AvailabilitySlot"
import Provider from "@/models/Provider"
import Clinic from "@/models/Clinic"

// GET - جلب المواعيد المتاحة
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const clinicId = searchParams.get("clinicId")
    const hospitalId = searchParams.get("hospitalId")
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "available"

    const query: any = {}

    if (providerId) query.providerId = providerId
    if (clinicId) query.clinicId = clinicId
    if (hospitalId) query.hospitalId = hospitalId
    if (type) query.type = type
    if (status) query.status = status

    // فلترة حسب التاريخ
    if (date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      query.date = { $gte: targetDate, $lt: nextDay }
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else {
      // بشكل افتراضي، جلب المواعيد من اليوم فصاعداً
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query.date = { $gte: today }
    }

    const slots = await AvailabilitySlot.find(query)
      .populate("providerId", "name nameAr specialty specialtyAr image")
      .sort({ date: 1, startTime: 1 })
      .lean()

    if (slots.length === 0 && date && (providerId || clinicId)) {
      const virtualSlots = await generateVirtualSlots(providerId, clinicId, date)
      return NextResponse.json({
        success: true,
        slots: virtualSlots,
        isVirtual: true,
      })
    }

    const transformedSlots = slots.map((slot: any) => ({
      id: slot._id.toString(),
      providerId: slot.providerId?._id?.toString() || slot.providerId,
      providerName: slot.providerId?.nameAr || "",
      providerSpecialty: slot.providerId?.specialtyAr || "",
      providerImage: slot.providerId?.image || "",
      clinicId: slot.clinicId?.toString(),
      hospitalId: slot.hospitalId?.toString(),
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      type: slot.type,
      status: slot.status,
      price: slot.price,
    }))

    return NextResponse.json({
      success: true,
      slots: transformedSlots,
    })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المواعيد" }, { status: 500 })
  }
}

async function generateVirtualSlots(providerId: string | null, clinicId: string | null, date: string) {
  try {
    const targetDate = new Date(date)
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    const dayName = dayNames[targetDate.getDay()]

    let startTime = "09:00"
    let endTime = "21:00"
    let slotDuration = 30
    let providerData: any = null

    // جلب إعدادات العيادة إذا كان هناك clinicId
    if (clinicId) {
      const clinic = await Clinic.findById(clinicId).lean()
      if (clinic) {
        startTime = clinic.defaultStartTime || "09:00"
        endTime = clinic.defaultEndTime || "21:00"
        slotDuration = clinic.slotDuration || 30

        // التحقق من أن اليوم يوم عمل
        const workingDay = clinic.workingHours?.find((wh: any) => wh.day === dayName && wh.isOpen)
        if (!workingDay) {
          return [] // لا مواعيد في أيام غير العمل
        }
        if (workingDay.openTime) startTime = workingDay.openTime
        if (workingDay.closeTime) endTime = workingDay.closeTime
      }
    }

    // جلب بيانات الطبيب للسعر
    if (providerId) {
      providerData = await Provider.findById(providerId).lean()
    }

    // توليد المواعيد
    const virtualSlots = []
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour * 60 + currentMin + slotDuration <= endHour * 60 + endMin) {
      const slotStart = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`

      let endSlotMin = currentMin + slotDuration
      let endSlotHour = currentHour
      if (endSlotMin >= 60) {
        endSlotHour += Math.floor(endSlotMin / 60)
        endSlotMin = endSlotMin % 60
      }
      const slotEnd = `${String(endSlotHour).padStart(2, "0")}:${String(endSlotMin).padStart(2, "0")}`

      virtualSlots.push({
        id: `v_${slotStart.replace(":", "")}`,
        providerId: providerId || null,
        providerName: providerData?.nameAr || "",
        providerSpecialty: providerData?.specialtyAr || "",
        providerImage: providerData?.image || "",
        clinicId: clinicId || null,
        date: targetDate,
        startTime: slotStart,
        endTime: slotEnd,
        duration: slotDuration,
        type: "clinic",
        status: "available",
        price: providerData?.consultationFee || 0,
      })

      currentMin += slotDuration
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return virtualSlots
  } catch (error) {
    console.error("Error generating virtual slots:", error)
    return []
  }
}

// POST - إنشاء مواعيد متاحة (للطبيب/الأدمن)
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { providerId, clinicId, hospitalId, date, slots, type } = body

    if (!providerId || !date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    // التحقق من وجود الطبيب
    const provider = await Provider.findById(providerId)
    if (!provider) {
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    // تحديد السعر حسب نوع الموعد
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
    const targetDate = new Date(date)

    for (const slot of slots) {
      const { startTime, endTime, duration } = slot
      const slotType = type || "clinic"

      // التحقق من عدم وجود موعد مكرر
      const existingSlot = await AvailabilitySlot.findOne({
        providerId,
        date: targetDate,
        startTime,
        status: { $ne: "blocked" },
      })

      if (!existingSlot) {
        const newSlot = await AvailabilitySlot.create({
          providerId,
          clinicId,
          hospitalId,
          date: targetDate,
          startTime,
          endTime,
          duration: duration || 30,
          type: slotType,
          status: "available",
          price: getPrice(slotType),
        })
        createdSlots.push(newSlot)
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إنشاء ${createdSlots.length} موعد بنجاح`,
      slots: createdSlots.map((s) => ({
        id: s._id.toString(),
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    })
  } catch (error) {
    console.error("Error creating slots:", error)
    return NextResponse.json({ success: false, error: "فشل في إنشاء المواعيد" }, { status: 500 })
  }
}
