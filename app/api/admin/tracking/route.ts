import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Tracking, { getStatusInfo } from "@/models/Tracking"

// GET - جلب جميع سجلات التتبع للأدمن
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)

    const referenceType = searchParams.get("referenceType")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const filter: any = {}

    if (referenceType) filter.referenceType = referenceType
    if (status) filter.currentStatus = status
    if (search) {
      filter.$or = [
        { trackingNumber: { $regex: search, $options: "i" } },
        { assignedTo: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [trackings, total] = await Promise.all([
      Tracking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Tracking.countDocuments(filter),
    ])

    const trackingsWithInfo = trackings.map((tracking: any) => ({
      ...tracking,
      currentStatusInfo: getStatusInfo(tracking.referenceType, tracking.currentStatus),
    }))

    return NextResponse.json({
      success: true,
      data: trackingsWithInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching trackings:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب بيانات التتبع" }, { status: 500 })
  }
}
