import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import AvailabilitySlot from "@/models/AvailabilitySlot"
import User from "@/models/User"
import Provider from "@/models/Provider"

// GET - جلب حجز معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const booking = await Booking.findById(id)
      .populate("providerId", "name nameAr specialty specialtyAr image phone")
      .populate("clinicId", "name nameAr address phone")
      .populate("hospitalId", "name nameAr address phone")
      .lean()

    if (!booking) {
      return NextResponse.json({ success: false, error: "الحجز غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: (booking as any)._id.toString(),
        bookingNumber: (booking as any).bookingNumber,
        provider: (booking as any).providerId,
        clinic: (booking as any).clinicId,
        hospital: (booking as any).hospitalId,
        patientName: (booking as any).patientName,
        patientPhone: (booking as any).patientPhone,
        patientEmail: (booking as any).patientEmail,
        patientAge: (booking as any).patientAge,
        patientGender: (booking as any).patientGender,
        date: (booking as any).date,
        startTime: (booking as any).startTime,
        endTime: (booking as any).endTime,
        type: (booking as any).type,
        address: (booking as any).address,
        symptoms: (booking as any).symptoms,
        notes: (booking as any).notes,
        price: (booking as any).price,
        discountCode: (booking as any).discountCode,
        discountAmount: (booking as any).discountAmount,
        totalPrice: (booking as any).totalPrice,
        paymentMethod: (booking as any).paymentMethod,
        paymentStatus: (booking as any).paymentStatus,
        status: (booking as any).status,
        cancelReason: (booking as any).cancelReason,
        rating: (booking as any).rating,
        review: (booking as any).review,
        createdAt: (booking as any).createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الحجز" }, { status: 500 })
  }
}

// PUT - تحديث حجز (تغيير الحالة، إضافة تقييم)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const body = await request.json()
    const { status, cancelReason, rating, review } = body

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ success: false, error: "الحجز غير موجود" }, { status: 404 })
    }

    // تحديث الحالة
    if (status) {
      // التحقق من صلاحية تغيير الحالة
      if (status === "cancelled") {
        if (booking.status === "completed") {
          return NextResponse.json({ success: false, error: "لا يمكن إلغاء حجز مكتمل" }, { status: 400 })
        }

        booking.status = "cancelled"
        booking.cancelReason = cancelReason || ""
        booking.cancelledBy = user.role === "admin" ? "admin" : "user"
        booking.cancelledAt = new Date()

        // إعادة الموعد للحالة المتاحة
        await AvailabilitySlot.findByIdAndUpdate(booking.slotId, {
          status: "available",
          bookingId: null,
        })

        // استرداد المبلغ للمحفظة إذا كان مدفوعاً
        if (booking.paymentStatus === "paid" && booking.paymentMethod === "wallet") {
          const bookingUser = await User.findById(booking.userId)
          if (bookingUser) {
            bookingUser.walletBalance += booking.totalPrice
            await bookingUser.save()
          }
          booking.paymentStatus = "refunded"
        }
      } else if (status === "completed") {
        booking.status = "completed"
        booking.completedAt = new Date()

        // ��حديث حالة الموعد
        await AvailabilitySlot.findByIdAndUpdate(booking.slotId, {
          status: "completed",
        })
      } else if (status === "confirmed") {
        booking.status = "confirmed"
      }
    }

    // إضافة تقييم
    if (rating && booking.status === "completed") {
      booking.rating = rating
      booking.review = review || ""
      booking.reviewedAt = new Date()

      // تحديث تقييم الطبيب
      const provider = await Provider.findById(booking.providerId)
      if (provider) {
        const totalRatings = provider.reviewsCount * provider.rating + rating
        provider.reviewsCount += 1
        provider.rating = totalRatings / provider.reviewsCount
        await provider.save()
      }
    }

    await booking.save()

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        rating: booking.rating,
      },
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث الحجز" }, { status: 500 })
  }
}

// DELETE - حذف حجز (للأدمن فقط)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 })
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ success: false, error: "الحجز غير موجود" }, { status: 404 })
    }

    // إعادة الموعد للحالة المتاحة
    await AvailabilitySlot.findByIdAndUpdate(booking.slotId, {
      status: "available",
      bookingId: null,
    })

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "تم حذف الحجز بنجاح" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف الحجز" }, { status: 500 })
  }
}
