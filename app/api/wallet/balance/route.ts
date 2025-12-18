import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email }).select("walletBalance")

    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      balance: user.walletBalance ?? 0,
      currency: "EGP",
    })
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ في جلب الرصيد" }, { status: 500 })
  }
}
