import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AvailabilitySlot from "@/models/AvailabilitySlot"

// GET - جلب موعد معين
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const slot = await AvailabilitySlot.findById(id)
      .populate("providerId", "name nameAr specialty specialtyAr image consultationFee")
      .lean()

    if (!slot) {
      return NextResponse.json({ success: false, error: "الموعد غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      slot: {
        id: (slot as any)._id.toString(),
        providerId: (slot as any).providerId?._id?.toString(),
        provider: (slot as any).providerId,
        clinicId: (slot as any).clinicId?.toString(),
        hospitalId: (slot as any).hospitalId?.toString(),
        date: (slot as any).date,
        startTime: (slot as any).startTime,
        endTime: (slot as any).endTime,
        duration: (slot as any).duration,
        type: (slot as any).type,
        status: (slot as any).status,
        price: (slot as any).price,
      },
    })
  } catch (error) {
    console.error("Error fetching slot:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب الموعد" }, { status: 500 })
  }
}

// PUT - تحديث موعد (حظر/إلغاء حظر)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const slot = await AvailabilitySlot.findById(id)

    if (!slot) {
      return NextResponse.json({ success: false, error: "الموعد غير موجود" }, { status: 404 })
    }

    // لا يمكن تعديل موعد محجوز
    if (slot.status === "booked" && body.status !== "completed") {
      return NextResponse.json({ success: false, error: "لا يمكن تعديل موعد محجوز" }, { status: 400 })
    }

    const updatedSlot = await AvailabilitySlot.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()

    return NextResponse.json({
      success: true,
      slot: {
        id: (updatedSlot as any)._id.toString(),
        status: (updatedSlot as any).status,
      },
    })
  } catch (error) {
    console.error("Error updating slot:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث الموعد" }, { status: 500 })
  }
}

// DELETE - حذف موعد
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const slot = await AvailabilitySlot.findById(id)

    if (!slot) {
      return NextResponse.json({ success: false, error: "الموعد غير موجود" }, { status: 404 })
    }

    // لا يمكن حذف موعد محجوز
    if (slot.status === "booked") {
      return NextResponse.json({ success: false, error: "لا يمكن حذف موعد محجوز" }, { status: 400 })
    }

    await AvailabilitySlot.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "تم حذف الموعد بنجاح" })
  } catch (error) {
    console.error("Error deleting slot:", error)
    return NextResponse.json({ success: false, error: "فشل في حذف الموعد" }, { status: 500 })
  }
}
