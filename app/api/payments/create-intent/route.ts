import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import PaymentTransaction from "@/models/PaymentTransaction"
import User from "@/models/User"

// POST - Create payment intent
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { bookingId, amount, method, provider } = body

    if (!bookingId || !amount || !method) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, userId: user._id })
    if (!booking) {
      return NextResponse.json({ success: false, error: "الحجز غير موجود" }, { status: 404 })
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: false, error: "تم دفع هذا الحجز مسبقاً" }, { status: 400 })
    }

    // Create payment transaction
    const paymentTransaction = new PaymentTransaction({
      bookingId: booking._id,
      userId: user._id,
      amount,
      method,
      provider: provider || undefined,
      type: "payment",
      status: "processing",
    })
    await paymentTransaction.save()

    // For card payments, integrate with payment provider (Stripe/Paymob)
    // This is a placeholder - integrate actual payment provider here
    let paymentResponse: any = {
      success: true,
      transactionId: paymentTransaction.transactionId,
    }

    if (method === "card" && provider === "stripe") {
      // TODO: Create Stripe payment intent
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // const paymentIntent = await stripe.paymentIntents.create({...})
      paymentResponse = {
        ...paymentResponse,
        provider: "stripe",
        // clientSecret: paymentIntent.client_secret,
      }
    }

    return NextResponse.json({
      success: true,
      payment: paymentResponse,
      transaction: {
        id: paymentTransaction._id.toString(),
        transactionId: paymentTransaction.transactionId,
        amount: paymentTransaction.amount,
        status: paymentTransaction.status,
      },
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ success: false, error: "فشل في إنشاء طلب الدفع" }, { status: 500 })
  }
}
