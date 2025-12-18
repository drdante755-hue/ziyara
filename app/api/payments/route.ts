import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import PaymentTransaction from "@/models/PaymentTransaction"
import User from "@/models/User"

// GET - Get payment transactions
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = {}

    // Only admin can see all transactions
    if (user.role !== "admin") {
      query.userId = user._id
    }

    if (bookingId) query.bookingId = bookingId
    if (status) query.status = status

    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      PaymentTransaction.find(query)
        .populate("bookingId", "bookingNumber date startTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentTransaction.countDocuments(query),
    ])

    const transformedTransactions = transactions.map((t: any) => ({
      id: t._id.toString(),
      transactionId: t.transactionId,
      booking: t.bookingId
        ? {
            id: t.bookingId._id.toString(),
            bookingNumber: t.bookingId.bookingNumber,
            date: t.bookingId.date,
            startTime: t.bookingId.startTime,
          }
        : null,
      amount: t.amount,
      currency: t.currency,
      method: t.method,
      provider: t.provider,
      type: t.type,
      status: t.status,
      metadata: t.metadata,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    }))

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب المعاملات" }, { status: 500 })
  }
}
