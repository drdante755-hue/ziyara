import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { TestRequest } from "@/models/Service"

// GET - جلب جميع طلبات التحاليل
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
      filter.$or = [{ patientName: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }]
    }

    const requests = await TestRequest.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("Error fetching test requests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب طلبات التحاليل" }, { status: 500 })
  }
}

// POST - إضافة طلب تحليل جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.patientName || !body.phone || !body.address || !body.tests || !body.date || !body.time) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const testRequest = await TestRequest.create({
      patientName: body.patientName,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      address: body.address,
      tests: body.tests,
      totalPrice: body.totalPrice || 0,
      date: body.date,
      time: body.time,
      notes: body.notes,
      team: body.team,
      status: body.status || "جاري",
    })

    return NextResponse.json({
      success: true,
      data: testRequest,
      message: "تم إنشاء الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error creating test request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 })
  }
}
