import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { HomeAnalysisRequest } from "@/models/HomeAnalysis"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const analysisRequest = await HomeAnalysisRequest.findByIdAndUpdate(id, body, { new: true, runValidators: true })

    if (!analysisRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: analysisRequest,
      message: "تم تحديث الطلب بنجاح",
    })
  } catch (error) {
    console.error("[v0] Error updating home analysis request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحديث الطلب" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const analysisRequest = await HomeAnalysisRequest.findByIdAndDelete(id)

    if (!analysisRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    })
  } catch (error) {
    console.error("[v0] Error deleting home analysis request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف الطلب" }, { status: 500 })
  }
}
