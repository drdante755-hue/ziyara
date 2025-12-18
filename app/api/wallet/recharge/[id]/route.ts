import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import WalletRecharge from "@/models/WalletRecharge"
import WalletTransaction from "@/models/WalletTransaction"
import User from "@/models/User"
import ActivityLog from "@/models/ActivityLog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
// GET - Get single recharge
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const session = await getServerSession(authOptions)
    const recharge = await WalletRecharge.findById(id).populate("userId", "firstName lastName email phone")

    if (!recharge) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ recharge })
  } catch (error) {
    console.error("[v0] Error fetching recharge:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}

// PATCH - Approve or reject recharge (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { id } = await params
    const { action, adminNote } = body

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "الإجراء غير صحيح" }, { status: 400 })
    }

    const recharge = await WalletRecharge.findById(id)
    if (!recharge) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    if (recharge.status !== "pending") {
      return NextResponse.json({ error: "لا يمكن تعديل الطلب في هذه الحالة" }, { status: 400 })
    }

    if (action === "approve") {
      // Update recharge status
      recharge.status = "approved"
      await recharge.save()

      // Add amount to user wallet
      await User.findByIdAndUpdate(recharge.userId, { $inc: { walletBalance: recharge.amount } })

      // Create wallet transaction
      await WalletTransaction.create({
        userId: recharge.userId,
        type: "credit",
        amount: recharge.amount,
        description: "تم الموافقة على شحن المحفظة",
        referenceId: recharge._id,
      })

      // Log activity
      await ActivityLog.create({
        admin: session?.user?.name || "المسؤول",
        action: "الموافقة على شحن محفظة",
        type: "تعديل",
        details: `تمت الموافقة على طلب شحن محفظة بقيمة ${recharge.amount} جنيه`,
        target: "أخرى",
        targetId: recharge._id.toString(),
      })

      return NextResponse.json({ recharge, message: "تمت الموافقة على الطلب بنجاح" }, { status: 200 })
    } else if (action === "reject") {
      recharge.status = "rejected"
      recharge.adminNote = adminNote || ""
      await recharge.save()

      // Log activity
      await ActivityLog.create({
        admin: session?.user?.name || "المسؤول",
        action: "رفض شحن محفظة",
        type: "تعديل",
        details: `تم رفض طلب شحن محفظة: ${adminNote || "بدون ملاحظة"}`,
        target: "أخرى",
        targetId: recharge._id.toString(),
      })

      return NextResponse.json({ recharge, message: "تم رفض الطلب" }, { status: 200 })
    }
  } catch (error) {
    console.error("[v0] Error updating recharge:", error)
    return NextResponse.json({ error: "حدث خطأ في تحديث الطلب" }, { status: 500 })
  }
}
