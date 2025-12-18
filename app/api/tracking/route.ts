import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Tracking, { getStatusInfo, getOrderedStatuses } from "@/models/Tracking"

// GET - جلب التتبع بواسطة referenceType و referenceId
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const referenceType = searchParams.get("referenceType") as "home_test" | "product_order"
    const referenceId = searchParams.get("referenceId")
    const trackingNumber = searchParams.get("trackingNumber")

    if (!referenceType && !trackingNumber) {
      return NextResponse.json({ success: false, error: "يرجى توفير نوع المرجع أو رقم التتبع" }, { status: 400 })
    }

    let tracking

    if (trackingNumber) {
      tracking = await Tracking.findOne({ trackingNumber }).lean()
    } else if (referenceType && referenceId) {
      tracking = await Tracking.findOne({ referenceType, referenceId }).lean()
    }

    if (!tracking) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على بيانات التتبع" }, { status: 404 })
    }

    // إضافة معلومات الحالات
    const statusHistory = tracking.statusHistory.map((item: any) => ({
      ...item,
      statusInfo: getStatusInfo(tracking.referenceType, item.status),
    }))

    const orderedStatuses = getOrderedStatuses(tracking.referenceType)

    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        statusHistory,
        currentStatusInfo: getStatusInfo(tracking.referenceType, tracking.currentStatus),
        orderedStatuses,
      },
    })
  } catch (error) {
    console.error("Error fetching tracking:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب بيانات التتبع" }, { status: 500 })
  }
}

// POST - إنشاء تتبع جديد
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const { referenceType, referenceId, initialStatus = "order_created", note } = body

    if (!referenceType || !referenceId) {
      return NextResponse.json({ success: false, error: "يرجى توفير نوع المرجع و ID المرجع" }, { status: 400 })
    }

    // التحقق من عدم وجود تتبع مسبق
    const existingTracking = await Tracking.findOne({ referenceType, referenceId })
    if (existingTracking) {
      return NextResponse.json({
        success: true,
        data: existingTracking,
        message: "التتبع موجود بالفعل",
      })
    }

    // إنشاء التتبع - استخدام new + save لتفعيل الـ pre-save hook
    const tracking = new Tracking({
      referenceType,
      referenceId,
      currentStatus: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          note: note || "تم إنشاء الطلب",
          changedBy: "system",
          createdAt: new Date(),
        },
      ],
    })

    await tracking.save()

    return NextResponse.json({
      success: true,
      data: tracking,
      message: "تم إنشاء التتبع بنجاح",
    })
  } catch (error) {
    console.error("Error creating tracking:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إنشاء التتبع" }, { status: 500 })
  }
}
