import { NextResponse, type NextRequest } from "next/server"
import dbConnect from "@/lib/mongodb"
import WalletRecharge from "@/models/WalletRecharge"
import User from "@/models/User"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    const recharges = await WalletRecharge.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await WalletRecharge.countDocuments({ userId })

    return NextResponse.json(
      {
        recharges,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Error fetching user recharges:", err)
    return NextResponse.json({ error: "خطأ في جلب البيانات" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const { userId, paymentMethod, fromPhoneNumber, amount, screenshot } = body

    if (!userId || !fromPhoneNumber || !amount || !screenshot) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const recharge = await WalletRecharge.create({
      userId,
      paymentMethod,
      fromPhoneNumber,
      amount,
      screenshot,
      status: "pending",
    })

    return NextResponse.json({ recharge, message: "تم إنشاء الطلب بنجاح" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating recharge:", error)
    return NextResponse.json({ error: "فشل في إنشاء الطلب" }, { status: 500 })
  }
}
