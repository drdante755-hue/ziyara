import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { NurseRequest } from "@/models/Service"

// GET - جلب جميع طلبات الممرضات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const filter: any = {}

    if (status && status !== "الكل") {
      filter.status = status
    }

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ]
    }

    const requests = await NurseRequest.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("Error fetching nurse requests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب طلبات الممرضات" }, { status: 500 })
  }
}

// POST - إضافة طلب ممرضة جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.patientName || !body.phone || !body.address || !body.service || !body.date || !body.time) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const nurseRequest = await NurseRequest.create({
      patientName: body.patientName,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      address: body.address,
      service: body.service,
      date: body.date,
      time: body.time,
      notes: body.notes,
      nurse: body.nurse,
      status: body.status || "جاري",
    })

    return NextResponse.json({
      success: true,
      data: nurseRequest,
      message: "تم إنشاء الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error creating nurse request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 })
  }
}
