import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import AvailabilitySlot from "@/models/AvailabilitySlot"
import Provider from "@/models/Provider"
import User from "@/models/User"
import PaymentTransaction from "@/models/PaymentTransaction"

// GET - جلب الحجوزات
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const providerId = searchParams.get("providerId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // جلب المستخدم
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const query: any = {}

    // إذا كان المستخدم عادي، يرى حجوزاته فقط
    if (user.role !== "admin") {
      query.userId = user._id
    }

    if (status) query.status = status
    if (providerId) query.providerId = providerId

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("providerId", "name nameAr specialty specialtyAr image")
        .populate("clinicId", "name nameAr address")
        .populate("hospitalId", "name nameAr address")
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ])

    const transformedBookings = bookings.map((booking: any) => ({
      id: booking._id.toString(),
      bookingNumber: booking.bookingNumber,
      provider: booking.providerId
        ? {
            id: booking.providerId._id.toString(),
            name: booking.providerId.name,
            nameAr: booking.providerId.nameAr,
            specialty: booking.providerId.specialty,
            specialtyAr: booking.providerId.specialtyAr,
            image: booking.providerId.image,
          }
        : null,
      clinic: booking.clinicId
        ? {
            id: booking.clinicId._id.toString(),
            name: booking.clinicId.name,
            nameAr: booking.clinicId.nameAr,
            address: booking.clinicId.address,
          }
        : null,
      hospital: booking.hospitalId
        ? {
            id: booking.hospitalId._id.toString(),
            name: booking.hospitalId.name,
            nameAr: booking.hospitalId.nameAr,
            address: booking.hospitalId.address,
          }
        : null,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      type: booking.type,
      address: booking.address,
      symptoms: booking.symptoms,
      notes: booking.notes,
      price: booking.price,
      discountAmount: booking.discountAmount,
      totalPrice: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      rating: booking.rating,
      review: booking.review,
      createdAt: booking.createdAt,
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الحجوزات" }, { status: 500 })
  }
}

// POST - إنشاء حجز جديد
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
    const {
      slotId,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      address,
      symptoms,
      notes,
      paymentMethod,
      discountCode,
    } = body

    if (!slotId || !patientName || !patientPhone || !paymentMethod) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    const slot = await AvailabilitySlot.findOneAndUpdate(
      { _id: slotId, status: "available" },
      { status: "booked" },
      { new: true },
    )

    if (!slot) {
      return NextResponse.json({ success: false, error: "هذا الموعد غير متاح حالياً أو تم حجزه" }, { status: 400 })
    }

    // جلب الطبيب
    const provider = await Provider.findById(slot.providerId)
    if (!provider) {
      await AvailabilitySlot.findByIdAndUpdate(slotId, { status: "available" })
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    // حساب السعر والخصم
    const price = slot.price
    const discountAmount = 0

    // TODO: تطبيق كود الخصم إذا وجد
    if (discountCode) {
      // يمكن إضافة منطق الخصم هنا
    }

    const totalPrice = price - discountAmount

    // التحقق من رصيد المحفظة إذا كان الدفع بالمحفظة
    if (paymentMethod === "wallet") {
      if (user.walletBalance < totalPrice) {
        await AvailabilitySlot.findByIdAndUpdate(slotId, { status: "available" })
        return NextResponse.json({ success: false, error: "رصيد المحفظة غير كافٍ" }, { status: 400 })
      }
    }

    const booking = new Booking({
      userId: user._id,
      providerId: slot.providerId,
      slotId: slot._id,
      clinicId: slot.clinicId,
      hospitalId: slot.hospitalId,
      patientName,
      patientPhone,
      patientEmail: patientEmail || user.email,
      patientAge,
      patientGender,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      address,
      symptoms,
      notes,
      price,
      discountCode,
      discountAmount,
      totalPrice,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
    })

    await booking.save()

    // تحديث حالة الموعد مع booking reference
    slot.bookingId = booking._id
    await slot.save()

    const paymentTransaction = new PaymentTransaction({
      bookingId: booking._id,
      userId: user._id,
      amount: totalPrice,
      method: paymentMethod,
      type: "payment",
      status: paymentMethod === "cash" ? "pending" : "pending",
    })
    await paymentTransaction.save()

    // خصم من المحفظة إذا كان الدفع بالمحفظة
    if (paymentMethod === "wallet") {
      user.walletBalance -= totalPrice
      await user.save()

      // تحديث حالة الدفع
      booking.paymentStatus = "paid"
      booking.status = "confirmed"
      await booking.save()

      paymentTransaction.status = "completed"
      paymentTransaction.completedAt = new Date()
      await paymentTransaction.save()
    }

    // تحديث عدد المرضى للطبيب
    provider.totalPatients += 1
    await provider.save()

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        date: booking.date,
        startTime: booking.startTime,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
      payment: {
        transactionId: paymentTransaction.transactionId,
        status: paymentTransaction.status,
      },
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, error: "فشل في إنشاء الحجز" }, { status: 500 })
  }
}
