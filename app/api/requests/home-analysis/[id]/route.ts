import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { HomeAnalysisRequest } from "@/models/HomeAnalysis"
import ActivityLog from "@/models/ActivityLog"

// GET - Get single home analysis request
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const analysisRequest = await HomeAnalysisRequest.findById(id)

    if (!analysisRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: analysisRequest,
    })
  } catch (error) {
    console.error("[v0] Error fetching home analysis request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الطلب" }, { status: 500 })
  }
}

// PATCH - Update home analysis request
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const allowedUpdates = ["status", "assignedTeam", "analysisReportUrl", "notes"]
    const updates: any = {}

    for (const key of allowedUpdates) {
      if (key in body) {
        updates[key] = body[key]
      }
    }

    const analysisRequest = await HomeAnalysisRequest.findByIdAndUpdate(id, updates, { new: true, runValidators: true })

    if (!analysisRequest) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 })
    }

    // Log activity
    await ActivityLog.create({
      admin: "النظام",
      action: "تحديث طلب تحليل",
      type: "تحديث",
      details: `تم تحديث طلب التحليل - الحالة الجديدة: ${updates.status || analysisRequest.status}`,
      target: "طلب تحليل",
      targetId: id,
    })

    console.log("[v0] Home analysis request updated:", id)

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

// DELETE - Delete home analysis request
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

    // Log activity
    await ActivityLog.create({
      admin: "النظام",
      action: "حذف طلب تحليل",
      type: "حذف",
      details: `تم حذف طلب تحليل من ${analysisRequest.patientName}`,
      target: "طلب تحليل",
      targetId: id,
    })

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    })
  } catch (error) {
    console.error("[v0] Error deleting home analysis request:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف الطلب" }, { status: 500 })
  }
}
