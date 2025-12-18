import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"

// GET - Fetch activity logs
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const target = searchParams.get("target") || ""
    const period = searchParams.get("period") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const query: any = {}

    if (search) {
      query.$or = [
        { admin: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ]
    }

    if (type && type !== "الكل") {
      query.type = type
    }

    if (target && target !== "الكل") {
      query.target = target
    }

    // Period filter
    if (period) {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case "اليوم":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "أمس":
          startDate = new Date(now.setDate(now.getDate() - 1))
          startDate.setHours(0, 0, 0, 0)
          break
        case "هذا الأسبوع":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "هذا الشهر":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }

      query.createdAt = { $gte: startDate }
    }

    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActivityLog.countDocuments(query),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب سجل النشاط" }, { status: 500 })
  }
}

// POST - Create activity log (for manual logging)
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()

    const log = await ActivityLog.create(body)

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error("Error creating activity log:", error)
    return NextResponse.json({ error: "حدث خطأ في إنشاء السجل" }, { status: 500 })
  }
}
