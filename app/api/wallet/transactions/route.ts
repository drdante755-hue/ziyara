import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import WalletTransaction from "@/models/WalletTransaction"

// GET - Get user's wallet transactions
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const balanceResult = await WalletTransaction.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          credit: {
            $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] },
          },
          debit: {
            $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] },
          },
        },
      },
    ])

    const balance = balanceResult.length > 0 ? balanceResult[0].credit - balanceResult[0].debit : 0

    return NextResponse.json({
      transactions,
      balance,
      pagination: {
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
  }
}
