import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { NurseRequest } from "@/models/Service"

// GET - الحصول على طلب واحد
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const nurseRequest = await NurseRequest.findById(id).lean()

    if (!nurseRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: nurseRequest,
    })
  } catch (error) {
    console.error("Error fetching nurse request:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب بيانات الطلب" }, { status: 500 })
  }
}

// PUT - تحديث طلب ممرض
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const body = await request.json()
    const { date, time, notes, status } = body

    const updateData: Record<string, unknown> = {}
    if (date) updateData.date = date
    if (time) updateData.time = time
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status

    const nurseRequest = await NurseRequest.findByIdAndUpdate(id, updateData, { new: true })

    if (!nurseRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الطلب بنجاح",
      data: nurseRequest,
    })
  } catch (error) {
    console.error("Error updating nurse request:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث الطلب" }, { status: 500 })
  }
}

// DELETE - إلغاء طلب ممرض
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // نحدث الحالة لملغى بدلاً من الحذف
    const nurseRequest = await NurseRequest.findByIdAndUpdate(id, { status: "ملغى" }, { new: true })

    if (!nurseRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم إلغاء الطلب بنجاح",
      data: nurseRequest,
    })
  } catch (error) {
    console.error("Error cancelling nurse request:", error)
    return NextResponse.json({ success: false, error: "فشل في إلغاء الطلب" }, { status: 500 })
  }
}
