import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import connectDB from "@/lib/mongodb"
import { NurseRequest } from "@/models/Service"

// GET - جلب طلبات الممرض للمستخدم الحالي
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    await connectDB()

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const status = searchParams.get("status")

    // Build filter
    const filter: Record<string, unknown> = {}

    // إذا كان المستخدم مسجل الدخول، نجلب طلباته فقط
    if (session?.user?.phone) {
      filter.phone = session.user.phone
    } else if (phone) {
      filter.phone = phone
    }

    if (status && status !== "all") {
      filter.status = status
    }

    const requests = await NurseRequest.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("Error fetching nurse requests:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الطلبات" }, { status: 500 })
  }
}

// POST - إنشاء طلب ممرض جديد
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { patientName, phone, whatsapp, address, service, date, time, notes, nurseId, nurseName } = body

    // Validate required fields
    if (!patientName || !phone || !address || !service || !date || !time) {
      return NextResponse.json({ success: false, error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 })
    }

    const nurseRequest = await NurseRequest.create({
      patientName,
      phone,
      whatsapp: whatsapp || phone,
      address,
      service,
      date,
      time,
      notes: notes || "",
      nurse: nurseId || nurseName,
      status: "جاري",
    })

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب الممرض بنجاح",
      data: nurseRequest,
    })
  } catch (error) {
    console.error("Error creating nurse request:", error)
    return NextResponse.json({ success: false, error: "فشل في إنشاء الطلب" }, { status: 500 })
  }
}
