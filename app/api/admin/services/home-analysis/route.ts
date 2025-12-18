import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { HomeAnalysisRequest } from "@/models/HomeAnalysis"

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

    const requests = await HomeAnalysisRequest.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("[v0] Error fetching home analysis requests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    if (!body.patientName || !body.phone || !body.address) {
      return NextResponse.json({ success: false, error: "الرجاء ملء جميع الحقول المطلوبة" }, { status: 400 })
    }

    const analysisRequest = await HomeAnalysisRequest.create({
      patientName: body.patientName,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      address: body.address,
      selectedTests: body.selectedTests || [],
      totalPrice: body.totalPrice || 0,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      notes: body.notes,
      status: body.status || "pending",
    })

    return NextResponse.json(
      {
        success: true,
        data: analysisRequest,
        message: "تم إنشاء الطلب بنجاح",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating home analysis request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 })
  }
}
