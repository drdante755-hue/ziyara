import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك" },
        { status: 401 }
      )
    }

    await dbConnect()

    // البحث عن المستخدم والتحقق من إكمال الملف الشخصي
    const user = await User.findOne({ email: session.user.email }).lean()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        profileCompleted: user.profileCompleted || false,
        emailVerified: user.emailVerified || false,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          age: user.age,
          address: user.address,
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error("Check profile API error:", err)
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ بالخادم" },
      { status: 500 }
    )
  }
}
