import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { TestRequest } from "@/models/Service"

// GET - جلب طلب تحليل واحد
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const testRequest = await TestRequest.findById(id).lean()

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: testRequest,
    })
  } catch (error) {
    console.error("Error fetching test request:", error)
    return NextResponse.json({ success: false, error: "فشل في جلب بيانات الطلب" }, { status: 500 })
  }
}

// PUT - تحديث طلب تحليل
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

    const testRequest = await TestRequest.findByIdAndUpdate(id, updateData, { new: true })

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الطلب بنجاح",
      data: testRequest,
    })
  } catch (error) {
    console.error("Error updating test request:", error)
    return NextResponse.json({ success: false, error: "فشل في تحديث الطلب" }, { status: 500 })
  }
}

// DELETE - إلغاء طلب تحليل
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const testRequest = await TestRequest.findByIdAndUpdate(id, { status: "ملغى" }, { new: true })

    if (!testRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم إلغاء الطلب بنجاح",
      data: testRequest,
    })
  } catch (error) {
    console.error("Error cancelling test request:", error)
    return NextResponse.json({ success: false, error: "فشل في إلغاء الطلب" }, { status: 500 })
  }
}
