import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import WalletRecharge from "@/models/WalletRecharge"

// GET - Get all recharge requests (admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const query: any = {}
    if (status) query.status = status
    if (userId) query.userId = userId

    const recharges = await WalletRecharge.find(query)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await WalletRecharge.countDocuments(query)

    const transformedRecharges = recharges.map((recharge: any) => ({
      ...recharge,
      userInfo: recharge.userId,
      userId: recharge.userId?._id,
    }))

    return NextResponse.json({
      recharges: transformedRecharges,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching admin recharges:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}
