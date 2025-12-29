import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import Discount from "@/models/Discount"
import ActivityLog from "@/models/ActivityLog"
import WalletTransaction from "@/models/WalletTransaction"
import User from "@/models/User" // إضافة موديل المستخدم للتمكن من تحديث الرصيد

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    console.log("[v0] Received order data:", JSON.stringify(body, null, 2))

    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      shippingAddress,
      items,
      subtotal,
      discountCode,
      discountAmount,
      discountType,
      discountValue,
      total,
      paymentMethod,
      referenceNumber,
      paymentProofUrl,
      notes,
      paidWithWallet,
      userId,
    } = body

    // Validate required fields
    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      console.log("[v0] Validation failed - missing fields:", {
        customerName: !!customerName,
        customerPhone: !!customerPhone,
        shippingAddress: !!shippingAddress,
        itemsLength: items?.length,
      })
      return NextResponse.json({ error: "جميع البيانات المطلوبة يجب توفيرها" }, { status: 400 })
    }

    if (paidWithWallet && userId) {
      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
      }

      if (user.walletBalance < total) {
        return NextResponse.json({ error: "رصيد المحفظة غير كافٍ" }, { status: 400 })
      }
    }

    // If discount code was used, increment usage count
    if (discountCode) {
      const discount = await Discount.findOne({ code: discountCode.toUpperCase() })
      if (discount) {
        discount.usageCount += 1
        if (discount.usageCount >= discount.maxUsage) {
          discount.status = "منتهي"
        }
        await discount.save()
      }
    }

    const orderData = {
      orderNumber: generateOrderNumber(),
      customerName,
      customerPhone,
      customerWhatsapp,
      shippingAddress,
      items,
      subtotal,
      shippingCost: 0,
      discountCode,
      discountAmount: discountAmount || 0,
      discountType,
      discountValue,
      total,
      status: "pending",
      paymentMethod,
      paymentStatus: paidWithWallet ? "paid" : "pending",
      referenceNumber,
      paymentProofUrl: paymentProofUrl || null,
      notes,
      paidWithWallet: paidWithWallet || false,
      userId: userId || null,
    }

    // Create order
    const order = await Order.create(orderData)

    console.log("[v0] Order created successfully:", order._id)
    console.log("[v0] Payment proof URL saved:", !!paymentProofUrl)

    if (paidWithWallet && userId) {
      const user = await User.findById(userId)
      if (user) {
        user.walletBalance -= total
        await user.save()
        console.log(`[v0] Wallet balance updated for user ${userId}. New balance: ${user.walletBalance}`)
      }

      await WalletTransaction.create({
        userId,
        type: "debit",
        amount: total,
        description: `دفع طلب #${order.orderNumber}`,
        referenceId: order._id,
      })
    }

    // Log activity
    await ActivityLog.create({
      admin: "النظام",
      action: "طلب جديد",
      type: "إنشاء",
      details: `تم إنشاء طلب جديد #${order.orderNumber} من ${customerName}${paidWithWallet ? " (مدفوع من المحفظة)" : ""}`,
      target: "طلب",
      targetId: order._id.toString(),
    })

    return NextResponse.json({ order, message: "تم إنشاء الطلب بنجاح" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "حدث خطأ في إنشاء الطلب" }, { status: 500 })
  }
}

// GET - Get user orders (by userId from session)
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Get session for authenticated users
    const session = await getServerSession(authOptions)

    const query: any = {}

    // If user is authenticated via session
    if (session?.user?.id) {
      query.userId = session.user.id
    }
    // If userId provided as parameter (from authenticated client)
    else if (userId) {
      query.userId = userId
    }
    // No authentication
    else {
      return NextResponse.json(
        {
          success: false,
          error: "يجب تسجيل الدخول لعرض الطلبات",
        },
        { status: 401 },
      )
    }

    const orders = await Order.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الطلبات",
      },
      { status: 500 },
    )
  }
}
