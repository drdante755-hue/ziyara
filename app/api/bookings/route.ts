import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import dbConnect from "@/lib/mongodb"
import Booking from "@/models/Booking"
import AvailabilitySlot from "@/models/AvailabilitySlot"
import Provider from "@/models/Provider"
import Clinic from "@/models/Clinic"
import User from "@/models/User"
import PaymentTransaction from "@/models/PaymentTransaction"
import WalletTransaction from "@/models/WalletTransaction"

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
        .populate("medicalCenterId", "name nameAr address")
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
      medicalCenter: booking.medicalCenterId
        ? {
            id: booking.medicalCenterId._id.toString(),
            name: booking.medicalCenterId.name,
            nameAr: booking.medicalCenterId.nameAr,
            address: booking.medicalCenterId.address,
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
      providerId,
      clinicId, // added clinicId from body
      date: reqDate,
      startTime: reqStartTime,
      endTime: reqEndTime,
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
      fallbackSlot,
    } = body

    // Use user profile values as fallback for patient info when not provided in request
    const patientNameFinal = patientName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined
    const patientPhoneFinal = patientPhone || user.phone || undefined

    const makeTransactionId = () => {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, "0")
      const random = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0")
      return `TXN${year}${month}${random}`
    }

    if (!patientNameFinal || !patientPhoneFinal || !paymentMethod) {
      return NextResponse.json({ success: false, error: "البيانات المطلوبة غير مكتملة" }, { status: 400 })
    }

    let slot: any = null

    // Try to use provided slotId if it's a valid MongoDB ObjectId
    if (slotId && typeof slotId === "string") {
      const mongoose = (await import("mongoose")).default
      if (mongoose.Types.ObjectId.isValid(slotId)) {
        slot = await AvailabilitySlot.findOneAndUpdate(
          { _id: slotId, status: "available" },
          { status: "booked" },
          { new: true },
        )
      } else if (slotId.startsWith("v_") || (reqDate && reqStartTime)) {
        const targetDate = new Date(reqDate)
        targetDate.setHours(0, 0, 0, 0)

        // Try to find if a slot already exists for this provider, date, and time
        slot = await AvailabilitySlot.findOneAndUpdate(
          {
            providerId,
            date: targetDate,
            startTime: reqStartTime,
            status: "available",
          },
          { status: "booked" },
          { new: true },
        )

        // If no slot exists, create one (virtual slots become real on booking)
        if (!slot) {
          const provider = await Provider.findById(providerId)
          if (provider) {
            const newSlot = new AvailabilitySlot({
              providerId,
              clinicId: clinicId || provider.clinicId,
              date: targetDate,
              startTime: reqStartTime,
              endTime: reqEndTime || reqStartTime, // Fallback if endTime missing
              duration: 30, // Default duration
              type: "clinic",
              status: "booked",
              price: provider.consultationFee || 0,
            })
            await newSlot.save()
            slot = newSlot
          }
        }
      }
    }

    // If no valid slot found, try fallbackSlot
    if (!slot && fallbackSlot && fallbackSlot.providerId) {
      // create a booked slot so booking can reference it
      const { providerId, date, startTime, endTime, type, price } = fallbackSlot
      const duration = (() => {
        try {
          const [sh, sm] = (startTime || "09:00").split(":").map((s: string) => Number.parseInt(s))
          const [eh, em] = (endTime || "17:00").split(":").map((s: string) => Number.parseInt(s))
          const start = sh * 60 + sm
          const end = eh * 60 + em
          const d = end - start
          return d > 0 ? d : 30
        } catch (e) {
          return 30
        }
      })()

      // Ensure provider exists
      const provider = await Provider.findById(providerId)
      if (!provider) {
        return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
      }

      const newSlot = new AvailabilitySlot({
        providerId,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        type: type || "clinic",
        status: "booked",
        price: price ?? provider.consultationFee ?? 0,
        clinicId: provider.clinicId || undefined,
        medicalCenterId: provider.medicalCenterId || undefined,
      })

      await newSlot.save()
      slot = newSlot
    }

    if (!slot) {
      console.error("Booking: requested slot not available", {
        requestedSlotId: slotId,
        providerId,
        date: reqDate,
        startTime: reqStartTime,
        body,
      })

      // Try to reserve any matching available slot for the same provider/date/startTime
      try {
        if (providerId && reqDate && reqStartTime) {
          const mongoose = (await import("mongoose")).default
          if (mongoose.Types.ObjectId.isValid(providerId)) {
            const alt = await AvailabilitySlot.findOneAndUpdate(
              { providerId, date: new Date(reqDate), startTime: reqStartTime, status: "available" },
              { status: "booked" },
              { new: true },
            )

            if (alt) {
              slot = alt
            }
          }
        }
      } catch (e) {
        console.error("Error while attempting fallback slot reservation:", e)
      }

      if (!slot) {
        return NextResponse.json({ success: false, error: "هذا الموعد غير متاح حالياً أو تم حجزه" }, { status: 400 })
      }
    }

    // جلب الطبيب
    const provider = await Provider.findById(slot.providerId)
    if (!provider) {
      // if we created a fallback slot, remove or reset it
      try {
        if (slot && slot._id) await AvailabilitySlot.findByIdAndUpdate(slot._id, { status: "available" })
      } catch (e) {}
      return NextResponse.json({ success: false, error: "الطبيب غير موجود" }, { status: 404 })
    }

    // Enforce provider reception capacity when limited
    try {
      if (provider.receptionType === "limited") {
        const capacity = typeof provider.receptionCapacity === "number" ? provider.receptionCapacity : 0
        if (capacity <= 0) {
          // treat as no capacity
          if (slot && slot._id) await AvailabilitySlot.findByIdAndUpdate(slot._id, { status: "available" })
          return NextResponse.json({ success: false, error: "سعة استقبال الطبيب محددة بشكل غير صالح" }, { status: 400 })
        }

        const startOfDay = new Date(slot.date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(slot.date)
        endOfDay.setHours(23, 59, 59, 999)

        const activeCount = await Booking.countDocuments({
          providerId: provider._id,
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ["cancelled", "no-show"] },
        })

        if (activeCount >= capacity) {
          // revert slot booking
          try {
            if (slot && slot._id) await AvailabilitySlot.findByIdAndUpdate(slot._id, { status: "available" })
          } catch (e) {
            console.error("Error reverting slot after capacity full:", e)
          }
          return NextResponse.json({ success: false, error: "سعة استقبال الطبيب لهذا اليوم ممتلئة" }, { status: 400 })
        }
      }
    } catch (e) {
      console.error("Error checking provider reception capacity:", e)
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
    let paymentTransaction: any = null
    if (paymentMethod === "wallet") {
      if (user.walletBalance < totalPrice) {
        try {
          if (slot && slot._id) await AvailabilitySlot.findByIdAndUpdate(slot._id, { status: "available" })
        } catch (e) {}
        return NextResponse.json({ success: false, error: "رصيد المحفظة غير كافٍ" }, { status: 400 })
      }

      user.walletBalance -= totalPrice
      await user.save()
    }

    // determine booking address: prefer user-provided address, fallback to clinic address
    let bookingAddress = address
    if (!bookingAddress && slot.clinicId) {
      bookingAddress = (await Clinic.findById(slot.clinicId)).address
    }

    const booking = new Booking({
      userId: user._id,
      providerId: slot.providerId,
      slotId: slot._id,
      clinicId: slot.clinicId,
      medicalCenterId: slot.medicalCenterId,
      patientName: patientNameFinal,
      patientPhone: patientPhoneFinal,
      patientEmail: patientEmail || user.email,
      patientAge,
      patientGender,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      address: bookingAddress,
      symptoms,
      notes,
      price,
      discountCode,
      discountAmount,
      totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "wallet" ? "paid" : "pending",
      status: paymentMethod === "wallet" ? "confirmed" : "pending",
    })

    await booking.save()

    if (paymentMethod === "wallet") {
      await WalletTransaction.create({
        userId: user._id,
        type: "debit",
        amount: totalPrice,
        description: `حجز موعد #${booking.bookingNumber}`,
        referenceId: booking._id,
      })

      paymentTransaction = new PaymentTransaction({
        transactionId: makeTransactionId(),
        bookingId: booking._id,
        userId: user._id,
        amount: totalPrice,
        method: paymentMethod,
        type: "payment",
        status: "completed",
        completedAt: new Date(),
      })
      await paymentTransaction.save()
    }

    // تحديث حالة الموعد مع booking reference
    slot.bookingId = booking._id
    await slot.save()

    if (!paymentTransaction) {
      paymentTransaction = new PaymentTransaction({
        transactionId: makeTransactionId(),
        bookingId: booking._id,
        userId: user._id,
        amount: totalPrice,
        method: paymentMethod,
        type: "payment",
        status: paymentMethod === "cash" ? "pending" : "pending",
      })
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
