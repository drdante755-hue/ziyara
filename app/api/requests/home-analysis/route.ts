import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { HomeAnalysisRequest } from "@/models/HomeAnalysis"
import ActivityLog from "@/models/ActivityLog"

// POST - Create new home analysis request
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    console.log("[v0] Received home analysis request:", JSON.stringify(body, null, 2))

    const {
      patientName,
      phone,
      whatsapp,
      address,
      selectedTests,
      totalPrice,
      preferredDate,
      preferredTime,
      notes,
      userId,
    } = body

    if (!patientName || !phone || !address || !selectedTests || selectedTests.length === 0 || !totalPrice) {
      console.log("[v0] Validation failed - missing fields:", {
        patientName: !!patientName,
        phone: !!phone,
        address: !!address,
        selectedTestsLength: selectedTests?.length,
        totalPrice: !!totalPrice,
      })
      return NextResponse.json({ success: false, error: "جميع البيانات المطلوبة يجب توفيرها" }, { status: 400 })
    }

    if (!preferredDate || !preferredTime) {
      return NextResponse.json({ success: false, error: "يجب تحديد التاريخ والوقت المفضلين" }, { status: 400 })
    }

    const analysisRequest = await HomeAnalysisRequest.create({
      userId,
      patientName,
      phone,
      whatsapp: whatsapp || phone,
      address,
      selectedTests,
      totalPrice,
      preferredDate,
      preferredTime,
      notes,
      status: "pending",
    })

    // Log activity
    await ActivityLog.create({
      admin: "النظام",
      action: "طلب تحليل منزلي جديد",
      type: "إنشاء",
      details: `تم إنشاء طلب تحليل منزلي من ${patientName}`,
      target: "طلب تحليل",
      targetId: analysisRequest._id.toString(),
    })

    console.log("[v0] Home analysis request created:", analysisRequest._id)

    return NextResponse.json(
      {
        success: true,
        data: analysisRequest,
        message: "تم إنشاء الطلب بنجاح. سيتم التواصل معك قريباً لتأكيد الموعد",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating home analysis request:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
    }
    return NextResponse.json({ success: false, error: "حدث خطأ في إنشاء الطلب" }, { status: 500 })
  }
}

// GET - Get all home analysis requests (for admin) or user requests
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    const filter: any = {}

    if (status && status !== "الكل") {
      filter.status = status
    }

    if (userId) {
      filter.userId = userId
    }

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ]
    }

    const requests = await HomeAnalysisRequest.find(filter).sort({ createdAt: -1 }).lean()

    console.log("[v0] Fetched home analysis requests:", requests.length)

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching home analysis requests:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
