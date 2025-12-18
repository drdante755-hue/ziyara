import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Tracking from "@/models/Tracking"
import { TestRequest } from "@/models/Service"

// POST - رفع ملف النتائج
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const { trackingId, resultsFileUrl, note } = body

    if (!trackingId || !resultsFileUrl) {
      return NextResponse.json({ success: false, error: "يرجى توفير معرف التتبع ورابط الملف" }, { status: 400 })
    }

    const tracking = await Tracking.findById(trackingId)

    if (!tracking) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على بيانات التتبع" }, { status: 404 })
    }

    // تحديث التتبع
    tracking.resultsFileUrl = resultsFileUrl
    tracking.currentStatus = "results_ready"
    tracking.statusHistory.push({
      status: "results_ready",
      note: note || "تم رفع نتائج التحليل",
      changedBy: "admin",
      createdAt: new Date(),
    })

    await tracking.save()

    // تحديث طلب التحليل
    if (tracking.referenceType === "home_test") {
      await TestRequest.findByIdAndUpdate(tracking.referenceId, {
        resultsFileUrl,
      })
    }

    return NextResponse.json({
      success: true,
      data: tracking,
      message: "تم رفع النتائج بنجاح",
    })
  } catch (error) {
    console.error("Error uploading results:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء رفع النتائج" }, { status: 500 })
  }
}
